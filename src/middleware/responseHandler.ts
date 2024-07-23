import { Response } from "express";
import httpCode from "../constants/http.constant";

// Interface for the JSON Response
interface JsonResponse {
    status: number;
    message: string;
    data?: any;
}

// Function to handle JSON responses
export const sendJsonResponse = (res: Response, status: number, message: string, data?: any): void => {
    const response: JsonResponse = { status, message, data };
    res.status(status).json(response);
};

export const sendSuccessResponse = (res: Response, message: string, data?: any): void => {
    sendJsonResponse(res, httpCode.OK, message, data);
};

export const badRequestResponse = (res: Response, message: string, data?: any): void => {
    sendJsonResponse(res, httpCode.BAD_REQUEST, message, data);
};

// Function to handle HTML responses
export const sendHtmlResponse = (res: Response, htmlContent: string): void => {
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
    res.end();
};
