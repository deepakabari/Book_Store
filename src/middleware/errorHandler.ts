import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { NextFunction, Request, Response } from "express";

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
    return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
        status: httpCode.INTERNAL_SERVER_ERROR,
        message: messageConstant.INTERNAL_SERVER_ERROR,
        data: error,
    });
}
