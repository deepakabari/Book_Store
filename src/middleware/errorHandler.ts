import { NextFunction, Request, Response } from "express";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { logger } from "../utils/logger";

export class ErrorHandler extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = false) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    // Log the error if needed
    logger.error(error);

    res.status(statusCode).json({
        status: statusCode,
        message,
    });
};
