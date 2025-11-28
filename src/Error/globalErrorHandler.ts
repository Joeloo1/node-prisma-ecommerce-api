import { Request, Response, NextFunction } from "express";


interface CustomError extends Error {
    statusCode?: number;
    status?: string;
    code?: number;
    name: string;
    isOperational?: boolean;
}

// send error in development  
const sendErrorDev = (err: CustomError, res: Response) => {
    res.status(err.statusCode || 500).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

// send error in production 
const sendErrorProd = (err: CustomError, res: Response) => {
    if (err.isOperational) {
        res.status(err.statusCode || 500).json({
            status: err.status,
            message: err.message
        })
    } else {
        // log the error 
        console.error('ERROR', err);
        // send generic error 
        res.status(err.statusCode || 500).json({
            status: 'Error',
            message: 'Something Went Wrong'
        })
    }
}

//  global Error Handler Middleware
export const globalErrorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        sendErrorProd(err, res)
    }
}