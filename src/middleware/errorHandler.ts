import { NextFunction, Request, Response } from "express";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { logger } from "../utils/logger";

// Define a custom error class
class ErrorHandler extends Error {
    status: number;
    message: string;
    isStripeError?: boolean;

    constructor(statusCode: number, message: string, isStripeError: boolean = false) {
        super();
        this.status = statusCode;
        this.message = message;
        this.isStripeError = isStripeError;
    }
    getDetails = () => {
        return {
            status: this.status,
            message: this.message,
        };
    };
}

// Middleware for handling errors
const handleError = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    // Check if the error object exists and if it's a Stripe error
    if (err.isStripeError) {
        // If it's a Stripe error, send the error details in the response
        res.status(err.status).json(err.getDetails());
    } else if (err instanceof ErrorHandler) {
        // Use the res object to send the error details in the response
        res.status(err.status).json(err.getDetails());
    } else {
        // If it's not an instance of ErrorHandler, send a generic internal server error response
        res.status(httpCode.INTERNAL_SERVER_ERROR).json({
            status: httpCode.INTERNAL_SERVER_ERROR,
            message: messageConstant.INTERNAL_SERVER_ERROR,
        });
    }
};

export { ErrorHandler, handleError };
