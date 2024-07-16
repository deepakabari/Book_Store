import httpCode from "../../../constants/http.constant";
import messageConstant from "../../../constants/message.constant";
import { ErrorHandler } from "../../../middleware/errorHandler";
import { User } from "../../../db/models";
import { Controller } from "../../../interfaces";
import stripe from "../../../db/config/stripe";

export const createBillingSession: Controller = async (req, res, next) => {
    const { userId } = req.params;

    // Find the user by their ID
    const user = await User.findByPk(userId);
    if (!user || !user.stripeCustomerId) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_FOUND));
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: "https://localhost:4000/account",
    });

    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: "Session created successfully.",
        data: session,
    });
};

export const retrieveEvent: Controller = async (req, res, next) => {
    const events = stripe.events.list();

    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: "Events retrieved successfully.",
        data: events,
    });
};
