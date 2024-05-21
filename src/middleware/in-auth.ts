import jwt from 'jsonwebtoken';
import httpCode from '../constants/http.constant';
import messageConstant from '../constants/message.constant';
import { Request, Response, NextFunction } from 'express';
import { CustomJwtPayload } from '../interfaces';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
dotenv.config();

const SECRET = process.env.SECRET as string;

// Middleware for authenticating JWT tokens
export default (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Retrieve the Authorization header from the request
        const authHeader: string | undefined = req.get('Authorization');

        // If the Authorization header is missing, log the event and throw an error
        if (!authHeader) {
            logger.info('Authorization header is missing');
            const error: any = new Error(messageConstant.NOT_AUTHORIZED);
            error.statusCode = httpCode.UNAUTHORIZED;
            throw error;
        }

        // Extract the token from the Authorization header
        const token = authHeader.split(' ')[1];

        // Decode the JWT token using the secret key
        const decodedToken = jwt.verify(token, SECRET) as CustomJwtPayload;

        // If the token could not be decoded, log the event and throw an error
        if (!decodedToken) {
            logger.warn('Token could not be decoded');
            const error: any = messageConstant.NOT_AUTHORIZED;
            error.statusCode = httpCode.UNAUTHORIZED;
            throw error;
        }
        // Attach the decoded token to the request object
        req.user = decodedToken;

        // Log the successful authorization of the user
        logger.info(`User ${req.user.id} is authorized`);

        // Proceed to the next middleware
        next();
    } catch (error: any) {
        // Log any errors that occur during the authorization process
        logger.error('An error occurred during authorization', error);

        // Set the status code for the error and rethrow it
        error.statusCode = httpCode.INTERNAL_SERVER_ERROR;
        throw error;
    }
};
