import { NextFunction, Request, Response } from 'express'
import APIFeatures from './APIFeatures'
import AppError from './AppError'
import CatchAsync from './CatchAsync'

export const getAll = (Model: any) =>
    CatchAsync(
        async (
            request: Request,
            response: Response,
            nextFunction: NextFunction
        ) => {
            // building query
            const apiFetures = new APIFeatures(Model.find(), request.query)
                .filter()
                .sort()
                .limitFields()
                .pagination()

            // executing query
            const documents = await apiFetures.query

            // sending response
            response.status(200).json({
                status: 'success',
                length: documents.length,
                data: {
                    documents,
                },
            })
        }
    )

export const getOne = (Model: any) =>
    CatchAsync(
        async (request: Request, response: Response, next: NextFunction) => {
            const document = await Model.findById(request.params.id)

            if (!document)
                return next(
                    new AppError('No document exists with that id', 404)
                )

            response.status(200).json({
                status: 'success',
                data: {
                    document,
                },
            })
        }
    )

export const createOne = (Model: any) =>
    CatchAsync(
        async (request: Request, response: Response, next: NextFunction) => {
            const document = await Model.create(request.body)

            response.status(200).json({
                status: 'success',
                data: {
                    document,
                },
            })
        }
    )

export const updateOne = (Model: any) =>
    CatchAsync(
        async (request: Request, response: Response, next: NextFunction) => {
            const document = await Model.findByIdAndUpdate(
                request.params.id,
                request.body,
                {
                    runValidators: true,
                    new: true,
                }
            )

            if (!document)
                return next(
                    new AppError('No document exists with that id', 404)
                )

            response.status(200).json({
                status: 'success',
                data: {
                    document,
                },
            })
        }
    )

export const deleteOne = (Model: any) =>
    CatchAsync(
        async (request: Request, response: Response, next: NextFunction) => {
            const document = await Model.findByIdAndDelete(request.params.id)

            if (!document)
                return next(
                    new AppError('No document exists with that id', 404)
                )

            response.status(204).json({
                status: 'success',
                data: null,
            })
        }
    )
