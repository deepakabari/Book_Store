import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { ErrorHandler } from "../../middleware/errorHandler";
import { Plan, Subscription, User } from "../../db/models";
import { Controller } from "../../interfaces";
import stripe from "../../db/config/stripe";
import dotenv from "dotenv";
import Stripe from "stripe";
import { calculateRefundAmount } from "../../utils/calculateRefund";
import { Status } from "../../utils/enum";
dotenv.config();

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

const isBetterPlan = (currentPlan: string, newPlan: string) => {
    const planRanks: any = { Silver: 1, Gold: 2, Platinum: 3 };
    return planRanks[newPlan] > planRanks[currentPlan];
};

// Function to create a new plan in Stripe and save it in the database
export const createPlan: Controller = async (req, res, next) => {
    // Extract name and price from the request body
    const { name, price, trialEligible } = req.body;

    // Check if a plan with the same name already exists in the database
    const existingPlan = await Plan.findOne({ where: { name } });
    if (existingPlan) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.PLAN_EXISTS));
    }

    // Create a product in Stripe
    const product = await stripe.products.create({
        name,
    });

    // Create a price in Stripe associated with the product
    const stripePrice = await stripe.prices.create({
        currency: "gbp",
        unit_amount: price * 100,
        recurring: {
            interval: "month",
        },
        product_data: {
            name,
        },
    });

    // Create a plan in Stripe with the created product
    const plan = await stripe.plans.create({
        amount: price * 100,
        currency: "gbp",
        interval: "month",
        product: product.id,
    });

    // Save the newly created plan in database
    const newPlan = await Plan.create({
        name,
        price,
        stripePlanId: plan.id,
        stripePriceId: stripePrice.id,
        trialEligible,
    });

    // Respond with success message and the created plan
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.PLAN_CREATED,
        data: newPlan,
    });
};

// Define the retrievePlan controller
export const retrievePlan: Controller = async (req, res, next) => {
    // Extract the planId from the request parameters
    const { planId } = req.params;

    // Find the plan in the database using the planId
    const existingPlan = await Plan.findByPk(planId);

    // If plan is not found, return an error
    if (!existingPlan) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.PLAN_NOT_FOUND));
    }

    // Retrieve the plan details from Stripe using the stripePlanId from the existing plan record
    const plan = await stripe.plans.retrieve(existingPlan.stripePlanId);

    // Send the retrieved plan details in the response
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.PLAN_RETRIEVED,
        data: plan,
    });
};

// Function to create a new subscription for a user
export const createSubscription: Controller = async (req, res, next) => {
    const { userId, planId, taxRateIds } = req.body;

    // Find the user by ID
    const user = await User.findByPk(userId);
    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_FOUND));
    }

    // Find the plan by ID
    const plan = await Plan.findByPk(planId);
    if (!plan) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.PLAN_NOT_FOUND));
    }

    // Get the current subscription for the user (if any) that is not set to auto-renew
    const currentSubscription = await Subscription.findOne({ where: { userId, autoRenew: false } });

    let stripeSubscription;
    if (currentSubscription) {
        // Retrieve the subscription details from Stripe using the stripeSubscriptionId from the user record
        stripeSubscription = await stripe.subscriptions.retrieve(currentSubscription.stripeSubscriptionId);
    }

    let subscription;
    if (user.stripeCustomerId) {
        if (currentSubscription && stripeSubscription) {
            // Determine if new plan is better or worse than current plan
            const currentPlan = await Plan.findByPk(currentSubscription.planId);
            if (!currentPlan) {
                return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.PLAN_NOT_FOUND));
            }

            const isUpgrade = isBetterPlan(currentPlan.name, plan.name);

            if (isUpgrade) {
                // Calculate refund amount with 5% commission cut
                const cancelDate = stripeSubscription.canceled_at as number;
                const refundAmount = calculateRefundAmount(stripeSubscription, cancelDate);

                if (stripeSubscription.latest_invoice) {
                    // Fetch the latest invoice if needed
                    const latestInvoice =
                        typeof stripeSubscription.latest_invoice === "string"
                            ? await stripe.invoices.retrieve(stripeSubscription.latest_invoice)
                            : stripeSubscription.latest_invoice;

                    if (latestInvoice.payment_intent) {
                        // Retrieve the payment intent and create a refund
                        const paymentIntent = await stripe.paymentIntents.retrieve(
                            latestInvoice.payment_intent as string,
                        );
                        // Create a refund
                        await stripe.refunds.create({
                            charge: paymentIntent.latest_charge as string,
                            amount: Math.round(refundAmount),
                        });
                    }

                    // Cancel the current subscription immediately
                    await stripe.subscriptions.cancel(currentSubscription.stripeSubscriptionId);

                    // Create a new subscription in Stripe
                    subscription = await stripe.subscriptions.create({
                        customer: user.stripeCustomerId,
                        items: [{ plan: plan.stripePlanId }],
                        default_tax_rates: taxRateIds,
                        trial_period_days: plan.trialEligible ? 7 : undefined,
                    });

                    // Save the new subscription in the database
                    await Subscription.create({
                        userId: user.id,
                        planId: plan.id,
                        stripeSubscriptionId: subscription.id,
                        autoRenew: true,
                        status: Status.Active,
                        trialEnd: plan.trialEligible ? new Date(subscription.trial_end! * 1000) : null,
                    });

                    // Save the new subscription in the database
                    await currentSubscription.destroy();
                }
            } else {
                // Schedule the new subscription to start after the current subscription ends
                const subscriptionSchedule = await stripe.subscriptionSchedules.create({
                    customer: user.stripeCustomerId,
                    start_date: stripeSubscription.current_period_end,
                    end_behavior: "release",
                    phases: [
                        {
                            items: [{ plan: plan.stripePlanId }],
                            default_tax_rates: taxRateIds,
                        },
                    ],
                });

                // Create a new subscription in the database to start after the current one ends
                const scheduledSubscription = await Subscription.create({
                    userId: user.id,
                    planId: plan.id,
                    stripeSubscriptionId: subscriptionSchedule.id,
                    autoRenew: true,
                    status: Status.Active,
                });

                return res.status(httpCode.OK).json({
                    status: httpCode.OK,
                    message: messageConstant.SUBSCRIPTION_SCHEDULED,
                    data: scheduledSubscription,
                });
            }
        } else {
            // If no current subscription, create a new subscription immediately
            subscription = await stripe.subscriptions.create({
                customer: user.stripeCustomerId,
                items: [{ plan: plan.stripePlanId }],
                default_tax_rates: taxRateIds,
                trial_period_days: plan.trialEligible ? 7 : undefined,
            });

            // Save the new subscription in the database
            await Subscription.create({
                userId: user.id,
                planId: plan.id,
                stripeSubscriptionId: subscription.id,
                autoRenew: true,
                status: Status.Active,
                trialEnd: plan.trialEligible ? new Date(subscription.trial_end! * 1000) : null,
            });
        }
    } else {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.STRIPE_CUSTOMER_NOT_EXISTS));
    }

    // Respond with success message and the created subscription
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.SUBSCRIPTION_CREATED,
        data: subscription,
    });
};

// Define the retrieveSubscription controller
export const retrieveSubscription: Controller = async (req, res, next) => {
    // Extract the userId from the request parameters
    const { userId } = req.params;

    // Find the user subscription in the database using the userId
    const user = await Subscription.findOne({ where: { userId } });
    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_FOUND));
    }

    // Retrieve the subscription details from Stripe using the stripeSubscriptionId from the user record
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    // Send the retrieved subscription details in the response
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.SUBSCRIPTION_RETRIEVED,
        data: subscription,
    });
};

// Function to toggle the auto-renew option for a subscription
export const cancelSubscription: Controller = async (req, res, next) => {
    const subscriptionId = req.query.subscriptionId as string;

    // Find the subscription by ID
    const existingSubscription = await Subscription.findOne({ where: { stripeSubscriptionId: subscriptionId } });

    // If subscription is not found, return an error
    if (!existingSubscription) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.SUBSCRIPTION_NOT_FOUND));
    }

    // Update the subscription in Stripe to cancel at the end of the current period
    const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
    });

    // Toggle the auto-renew option in the local database
    existingSubscription.autoRenew = false;

    // Save the updated subscription in the database
    await existingSubscription.save();

    // Respond with success message
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.SUBSCRIPTION_CANCELED,
        data: subscription,
    });
};

export const cancelDirect: Controller = async (req, res, next) => {
    // Extract subscription id from request query parameters
    const subId = req.query.subId as string;

    const stripeSub = await stripe.subscriptions.cancel(subId, {
        prorate: true,
    });

    await Subscription.destroy({ where: { stripeSubscriptionId: subId } });

    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.SUBSCRIPTION_CANCELED,
        data: stripeSub,
    });
};

export const resumeSubscription: Controller = async (req, res, next) => {
    const subscriptionId = req.query.subscriptionId as string;

    // Find the subscription by ID
    const existingSubscription = await Subscription.findOne({ where: { stripeSubscriptionId: subscriptionId } });

    // If subscription is not found, return an error
    if (!existingSubscription) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.SUBSCRIPTION_NOT_FOUND));
    }

    const subscription = await stripe.subscriptions.resume(subscriptionId, {
        billing_cycle_anchor: "unchanged",
    });

    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.SUBSCRIPTION_RESUMED,
        data: subscription,
    });
};

export const webhook: Controller = async (req, res, next) => {
    const sig = req.headers["stripe-signature"] as string;

    const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);

    // Handle the event
    switch (event.type) {
        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            const subscriptionId = invoice.subscription as string;

            // Find the corresponding subscription schedule in your database
            const scheduledSubscription = await Subscription.findOne({
                where: { stripeSubscriptionId: subscriptionId },
            });

            if (scheduledSubscription) {
                // Update the subscription record with the new active subscription ID
                scheduledSubscription.stripeSubscriptionId = subscriptionId;
                await scheduledSubscription.save();
            } else {
                return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.SUBSCRIPTION_NOT_FOUND));
            }
            break;
        }
        case "subscription_schedule.updated": {
            const subscriptionSchedule = event.data.object as Stripe.SubscriptionSchedule;

            const subscriptionId = subscriptionSchedule.subscription as string;

            if (subscriptionSchedule.status === "active") {
                // Update the subscription schedule in your database
                await Subscription.update(
                    { stripeSubscriptionId: subscriptionId },
                    {
                        where: {
                            stripeSubscriptionId: subscriptionSchedule.id,
                            autoRenew: true,
                        },
                    },
                );
            }

            await stripe.subscriptionSchedules.release(subscriptionSchedule.id);

            const customer = subscriptionSchedule.customer as string;
            const user = await User.findOne({ where: { stripeCustomerId: customer } });
            if (!user) {
                return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_FOUND));
            }

            // Remove all non-auto-renew subscriptions for the user
            await Subscription.destroy({ where: { userId: user.id, autoRenew: false } });

            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(httpCode.OK);
};
