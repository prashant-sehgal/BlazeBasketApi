import { NextFunction, Request, Response } from 'express'
import Product from '../models/productModel'
import {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne,
    searchFromKeywords,
} from '../utils/RESTHandler'

export const getAllProducts = getAll(Product)
export const createNewProduct = createOne(Product)
export const searchAllProducts = searchFromKeywords(Product, [
    'title',
    'description',
])
// export const createNewProduct = async function (
//     req: Request,
//     response: Response,
//     next: NextFunction
// ) {
//     console.log(req.body)
//     response.json('done')
// }

export const getProduct = getOne(Product)

export const updateProduct = updateOne(Product)

export const deleteProduct = deleteOne(Product)
