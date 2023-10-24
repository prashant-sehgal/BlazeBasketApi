import { NextFunction, Request, Response } from "express"

// function that can catch errors in async functions and pass them directly to gloabl error handler
const CatchAsync = (fun: Function) => {
    return (request: Request, response: Response, next: NextFunction) => {
        fun(request, response, next).catch(next)
    }
}

export default CatchAsync