import { NextFunction, Request, Response } from "express";

// Define a custom error class
class ErrorHandler extends Error {
    status: number;
    message: string;

    constructor(statusCode: number, message: string) {
        super();
        this.status = statusCode;
        this.message = message;
    }
}

// Middleware for handling errors
const handleError = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    const { status, message } = err;
    res.status(status).json({
        status,
        message,
    });
};

export { ErrorHandler, handleError };
