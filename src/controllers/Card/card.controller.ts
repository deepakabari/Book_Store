import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { ErrorHandler } from "../../middleware/errorHandler";
import { Payment, User } from "../../db/models";
import { Controller } from "../../interfaces";
import stripe from "../../db/config/stripe";
import Stripe from "stripe";

// Way 2: 2. Controller to create a Stripe Checkout session for setting up payment methods
export const createSession: Controller = async (req, res, next) => {
    try {
        // Extract userId from request parameters
        const { userId } = req.params;

        // Find the user by primary key (userId)
        const user = await User.findByPk(userId);
        if (!user) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST);
        }

        // Create a Stripe Checkout session for setting up a payment method
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "setup",
            customer: user.stripeCustomerId,
            success_url: `http://localhost:4000/card/success/${userId}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: "http://localhost:4000/card/cancel",
        });

        // Respond with the session ID
        res.json({ id: session.id });
    } catch (error) {
        // Handle Stripe API errors specifically
        if (error instanceof Stripe.errors.StripeError) {
            const stripeError = (error.raw as any)?.message || "Unknown error";
            next(new ErrorHandler(httpCode.BAD_REQUEST, `Stripe API Error: ${stripeError}`, true));
        }
        next(error);
    }
};

// Way 2: 3. Controller to handle the success URL callback after a successful payment method setup
export const success: Controller = async (req, res, next) => {
    try {
        // Extract userId from request parameters and convert to a number
        const userId = +req.params.userId;

        // Find the user by primary key (userId)
        const user = await User.findByPk(userId);
        if (!user) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST);
        }

        // Extract session_id from query parameters
        const session_id = req.query.session_id as string;

        // Retrieve the Stripe Checkout session using the session_id
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.setup_intent) {
            const setupIntentId = session.setup_intent as string;

            // Retrieve the SetupIntent to get the payment method
            const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
            if (setupIntent.status === "succeeded") {
                if (setupIntent.payment_method) {
                    const paymentMethodId = setupIntent.payment_method as string;

                    // Attach the payment method to the customer
                    const customerId = user.stripeCustomerId as string;
                    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

                    // Update the customer's default payment method
                    await stripe.customers.update(customerId, {
                        invoice_settings: {
                            default_payment_method: paymentMethodId,
                        },
                    });

                    // Save the payment method information in the database
                    await Payment.create({
                        userId,
                        paymentMethodId,
                        stripeCustomerId: user.stripeCustomerId,
                    });

                    // Respond with a success message
                    res.send(messageConstant.PAYMENT_METHOD_ATTACHED);
                } else {
                    res.status(httpCode.BAD_REQUEST).send(messageConstant.PAYMENT_METHOD_FAILED);
                }
            } else {
                res.status(httpCode.BAD_REQUEST).send(session.url);
            }
        } else {
            res.status(httpCode.BAD_REQUEST).send(messageConstant.SETUP_INTENT_FAILED);
        }
    } catch (error) {
        // Handle Stripe API errors specifically
        if (error instanceof Stripe.errors.StripeError) {
            const stripeError = (error.raw as any)?.message || "Unknown error";
            next(new ErrorHandler(httpCode.BAD_REQUEST, `Stripe API Error: ${stripeError}`, true));
        }
        next(error);
    }
};
