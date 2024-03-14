import { NextFunction, Request, Response } from 'express'
import Review from '../models/reviewModel'
import CatchAsync from '../utils/CatchAsync'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../utils/RESTHandler'
import { RequestInterface } from '../models/interfaces/RequestInterface'
import User from '../models/userModel'

export const createReviewObject = CatchAsync(
    async (
        request: RequestInterface,
        Response: Response,
        next: NextFunction
    ) => {
        request.body.user = request.user.id
        next()
    }
)

export const createFilterObject = CatchAsync(
    async (
        request: RequestInterface,
        Response: Response,
        next: NextFunction
    ) => {
        request.query = { user: request.user.id }
        next()
    }
)

export const getAllReviews = getAll(Review)
export const createNewReview = createOne(Review)
export const getReview = getOne(Review)
export const updateReview = updateOne(Review)
export const deleteReview = deleteOne(Review)
