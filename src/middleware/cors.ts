import { Request, Response, NextFunction } from 'express';

// Middleware to handle CORS errors by setting appropriate headers
export default ((req: Request, res: Response, next: NextFunction) => {
    // Allow all origins to access the resources
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Specify the methods allowed when accessing the resource
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );

    // Specify the headers that can be used when making a request
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
    );
    // Pass the control to the next middleware function in the stack
    next();
});