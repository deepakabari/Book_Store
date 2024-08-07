import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { ErrorHandler } from "../../middleware/errorHandler";
import { Discount, Plan, Subscription, User } from "../../db/models";
import { Controller } from "../../interfaces";
import stripe from "../../db/config/stripe";
import dotenv from "dotenv";
import Stripe from "stripe";
import { calculateRefundAmount } from "../../utils/calculateRefund";
import { Status } from "../../utils/enum";
import { sendSuccessResponse } from "../../middleware/responseHandler";
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
    return sendSuccessResponse(res, messageConstant.PLAN_CREATED, newPlan);
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
    return sendSuccessResponse(res, messageConstant.PLAN_RETRIEVED, plan);
};

// Function to create a new subscription for a user
export const createSubscription: Controller = async (req, res, next) => {
    const { userId, planId, taxRateIds, discountCode } = req.body;

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

    let subscription, discount;

    // Validate discount code if provided
    if (discountCode) {
        discount = await Discount.findOne({ where: { code: discountCode, isActive: true } });
        if (!discount) {
            return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.INVALID_COUPON_CODE));
        }
        if (plan.price < discount.minPrice) {
            return next(
                new ErrorHandler(
                    httpCode.BAD_REQUEST,
                    `Discount code ${discountCode} is not valid for subscriptions below ${discount.minPrice} GBP.`,
                ),
            );
        }
        if (discount.maxPercentage && discount.percentage > discount.maxPercentage) {
            discount.percentage = discount.maxPercentage;
        }
    }

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
                        discounts: discount ? [{ coupon: discount.stripeCouponId }] : undefined,
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
                            discounts: discount ? [{ coupon: discount.stripeCouponId }] : undefined,
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

                return sendSuccessResponse(res, messageConstant.SUBSCRIPTION_SCHEDULED, scheduledSubscription);
            }
        } else {
            // If no current subscription, create a new subscription immediately
            subscription = await stripe.subscriptions.create({
                customer: user.stripeCustomerId,
                items: [{ plan: plan.stripePlanId }],
                default_tax_rates: taxRateIds,
                trial_period_days: plan.trialEligible ? 7 : undefined,
                discounts: discount ? [{ coupon: discount.stripeCouponId }] : undefined,
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
    return sendSuccessResponse(res, messageConstant.SUBSCRIPTION_CREATED, subscription);
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
    return sendSuccessResponse(res, messageConstant.SUBSCRIPTION_RETRIEVED, subscription);
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

    await existingSubscription.update(
        { autoRenew: false, status: Status.Inactive },
        { where: { stripeSubscriptionId: subscriptionId } },
    );

    // Respond with success message
    return sendSuccessResponse(res, messageConstant.SUBSCRIPTION_CANCELED, subscription);
};

export const cancelDirect: Controller = async (req, res, next) => {
    // Extract subscription id from request query parameters
    const subscriptionId = req.query.subscriptionId as string;

    const stripeSub = await stripe.subscriptions.cancel(subscriptionId, {
        prorate: true,
    });

    await Subscription.destroy({ where: { stripeSubscriptionId: subscriptionId } });

    return sendSuccessResponse(res, messageConstant.SUBSCRIPTION_CANCELED, stripeSub);
};

export const pauseCollection: Controller = async (req, res, next) => {
    // Get the subscription ID from the query parameters
    const subscriptionId = req.query.subscriptionId as string;

    // Find the subscription in the database using the Stripe subscription ID
    const existingSubscription = await Subscription.findOne({ where: { stripeSubscriptionId: subscriptionId } });

    // If the subscription is not found, return a 404 error
    if (!existingSubscription) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.SUBSCRIPTION_NOT_FOUND));
    }

    // Pause the subscription in Stripe by updating its 'pause_collection' property
    const subscription = await stripe.subscriptions.update(subscriptionId, {
        pause_collection: {
            behavior: "mark_uncollectible",
        },
    });

    // Respond with a success message and the updated subscription data
    return sendSuccessResponse(res, messageConstant.SUBSCRIPTION_PAUSED, subscription);
};

export const resumeSubscription: Controller = async (req, res, next) => {
    // Get the subscription ID from the query parameters
    const subscriptionId = req.query.subscriptionId as string;

    // Find the subscription in the database using the Stripe subscription ID
    const existingSubscription = await Subscription.findOne({ where: { stripeSubscriptionId: subscriptionId } });

    // If the subscription is not found, return a 404 error
    if (!existingSubscription) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.SUBSCRIPTION_NOT_FOUND));
    }

    // Resume the subscription in Stripe by setting 'pause_collection' to null
    const subscription = await stripe.subscriptions.update(subscriptionId, {
        pause_collection: null,
    });

    // Update the 'autoRenew' property of the subscription in the database to true
    existingSubscription.autoRenew = true;
    existingSubscription.save();

    // Respond with a success message and the updated subscription data
    return sendSuccessResponse(res, messageConstant.SUBSCRIPTION_RESUMED, subscription);
};

export const webhook: Controller = async (req, res, next) => {
    const sig = req.headers["stripe-signature"] as string;

    const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);

    // Handle the event
    switch (event.type) {
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
        case "customer.subscription.deleted": {
            const subscriptionId = event.data.object as Stripe.Subscription;

            const subId = subscriptionId.id;

            Subscription.destroy({ where: { stripeSubscriptionId: subId } });

            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    sendSuccessResponse(res, messageConstant.SUCCESS);
};
