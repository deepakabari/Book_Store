import { NextFunction, Request, Response } from 'express';

type ResponseBody<T> = {
    status: number;
    message: string;
    data?: T;
};

// Define a type 'Controller' that represents the structure of a controller function
type Controller<T = unknown> = (
    req: Request,
    res: Response<ResponseBody<T>>,
    next: NextFunction,
) => Promise<Response<ResponseBody<T>> | void>;

export { Controller };
