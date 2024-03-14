import { NextFunction, Request, Response } from 'express'
import AppError from './AppError'
import { sendEmail } from './Email'

// send full error to programmer on development mode
const sendErrorDev = (error: any, response: Response) => {
    response.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack,
    })
}

// handle mongodb id cast error in production
const handleMongodbCastError = (error: any) => {
    return new AppError(`Invalid ${error.path} : ${error.value}`, 400)
}

// handle mongodb duplicate field error in production
const handleMongodbDuplicateFieldError = (error: any) => {
    const fields = Object.keys(error.keyValue)
    return new AppError(
        `Duplicate field value for '${fields}' Please use another ${fields}`,
        400
    )
}

// handle mongodb validation error in production
const handleMongodbValidation = (error: any) => {
    return new AppError(error.message, 400)
}

// send error in production. if operational than send error message, if not, then send generic error message of something went very wrong
const sendErrorProd = (error: any, response: Response) => {
    if (error.isOperational) {
        response.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        })
    } else {
        sendEmail(
            'prashantsehgal.95790@gmail.com',
            '(BlazeBasket) Something went very wrong',
            `${JSON.stringify(error)} ${JSON.stringify(error.stack)}`
        )
        response.status(500).json({
            status: 'error',
            message: 'something went very wrong',
        })
    }
}

// global error handling middleware
export default (
    error: any,
    request: Request,
    response: Response,
    next: NextFunction
) => {
    error.statusCode = error.statusCode || 500
    error.status = error.status || 'error'
    if (process.env.NODE_ENV?.trim() === 'development')
        sendErrorDev(error, response)
    else if (process.env.NODE_ENV?.trim() === 'production') {
        let errorCopy = Object.assign(error)

        if (error.name === 'CastError')
            errorCopy = handleMongodbCastError(errorCopy)
        else if (error.code === 11000)
            errorCopy = handleMongodbDuplicateFieldError(errorCopy)
        else if (error.name === 'ValidationError')
            errorCopy = handleMongodbValidation(errorCopy)

        sendErrorProd(errorCopy, response)
    }
}
