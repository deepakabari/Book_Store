import httpCode from "../../../constants/http.constant";
import messageConstant from "../../../constants/message.constant";
import { ErrorHandler } from "../../../middleware/errorHandler";
import { Plan, TaxRate, User } from "../../../db/models";
import { Controller } from "../../../interfaces";
import stripe from "../../../db/config/stripe";
import linkConstant from "../../../constants/link.constant";
import { sendSuccessResponse } from "../../../middleware/responseHandler";

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

    return sendSuccessResponse(res, messageConstant.SESSION_CREATED, session);
};

export const checkoutSub: Controller = async (req, res, next) => {
    const { userId, planId, quantity } = req.body;

    // Find the user by primary key (userId)
    const user = await User.findByPk(userId);
    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    // Find the plan by ID
    const plan = await Plan.findByPk(planId);
    if (!plan) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.PLAN_NOT_FOUND));
    }

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: user.stripeCustomerId,
        line_items: [
            {
                price: plan.stripePriceId,
                quantity,
                dynamic_tax_rates: ["txr_1PdXDcRvdTPlq6v7fgChOLIZ", "txr_1PdXFKRvdTPlq6v7d5hJLKcA"],
            },
        ],
        success_url: `${linkConstant.SUCCESS}/${userId}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${linkConstant.CANCEL}`,
    });

    if (!session.url) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.SESSION_URL_MISSING));
    }

    // Respond with the session ID
    sendSuccessResponse(res, messageConstant.SUCCESS, session.url);
};

export const createTaxRate: Controller = async (req, res, next) => {
    const { displayName, description, jurisdiction, percentage, inclusive, country } = req.body;

    const existingTax = await TaxRate.findOne({
        where: { displayName },
    });
    if (existingTax) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.TAX_RATE_EXISTS));
    }

    const taxRate = await stripe.taxRates.create({
        display_name: displayName,
        description,
        jurisdiction,
        percentage,
        inclusive,
        country,
    });

    const newTaxRate = await TaxRate.create({
        stripeTaxRateId: taxRate.id,
        displayName,
        description,
        jurisdiction,
        percentage,
        inclusive,
    });

    return sendSuccessResponse(res, messageConstant.TAX_RATE_CREATED, newTaxRate);
};

export const retrieveTax: Controller = async (req, res, next) => {
    const { taxId } = req.params;

    const tax = await TaxRate.findByPk(taxId);
    if (!tax) {
        return next(new ErrorHandler(httpCode.OK, messageConstant.TAX_RATE_NOT_FOUND));
    }

    const taxRate = await stripe.taxRates.retrieve(tax.stripeTaxRateId);

    return sendSuccessResponse(res, messageConstant.TAX_RATE_RETRIEVED, taxRate);
};
