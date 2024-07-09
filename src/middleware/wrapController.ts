import { Request, Response, NextFunction } from "express";
import { Controller } from "../interfaces";
import { ErrorHandler } from "./errorHandler";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import Stripe from "stripe";

export const wrapController = (controller: Controller) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await controller(req, res, next);
        } catch (error: any) {
            // If a SequelizeUniqueConstraintError occurs, pass a CONFLICT error
            if (error.name === "SequelizeUniqueConstraintError") {
                return next(new ErrorHandler(httpCode.CONFLICT, messageConstant.NAME_UNIQUE));
            }
            // Handle Stripe API errors
            if (error instanceof Stripe.errors.StripeError) {
                const stripeError = (error.raw as any)?.message || "Unknown error";
                return next(new ErrorHandler(httpCode.BAD_REQUEST, `Stripe API Error: ${stripeError}`, true));
            }
            return next(error);
        }
    };
};
