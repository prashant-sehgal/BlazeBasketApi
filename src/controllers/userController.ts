import { NextFunction, Response } from 'express'
import { RequestInterface } from '../models/interfaces/RequestInterface'
import User from '../models/userModel'
import CatchAsync from '../utils/CatchAsync'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../utils/RESTHandler'
import AppError from '../utils/AppError'

// users routes for admins
export const getAllUsers = getAll(User)
export const createNewUser = createOne(User)
export const getUser = getOne(User)
export const updateUser = updateOne(User)
export const deleteUser = deleteOne(User)

export const updateMyPassword = CatchAsync(async function (
    request: RequestInterface,
    response: Response,
    next: NextFunction
) {
    if (
        !request.user.isPasswordValid(
            request.user.password,
            request.body.currentPassword
        )
    )
        return next(new AppError('current password is invalid', 400))

    request.user.resetPassword(request.body.newPassword)

    return response.status(200).json({
        status: 'success',
        message: 'password has been changed successfully',
    })
})

export const updateMe = CatchAsync(async function (
    request: RequestInterface,
    response: Response,
    next: NextFunction
) {
    if (!request.body.name || !request.body.image)
        return next(new AppError('please provide neccessary information', 400))

    request.user.updateMe(request.body.name, request.body.image)
    return response.status(200).json({
        status: 'success',
        message: 'user data updated',
    })
})
