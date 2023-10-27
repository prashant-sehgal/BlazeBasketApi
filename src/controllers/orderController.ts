import { NextFunction, Response } from 'express'
import Stripe from 'stripe'
import CatchAsync from '../utils/CatchAsync'
import { RequestInterface } from '../models/interfaces/RequestInterface'
import Product from '../models/productModel'
import AppError from '../utils/AppError'
import Order from '../models/orderModel'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../utils/RESTHandler'

interface ProductFieldInterface {
    id: string
    quantity: number
}

function limitString(message: string, words: number) {
    return `${message.split(' ').slice(0, words).join(' ')}...`
}

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`, {
    apiVersion: '2023-10-16',
})

export const checkoutSuccess = CatchAsync(
    async (
        request: RequestInterface,
        response: Response,
        next: NextFunction
    ) => {
        const sessionId = request.query.session_id
        if (!sessionId)
            return next(new AppError('please provide session id in query', 400))

        const session = await stripe.checkout.sessions.retrieve(`${sessionId}`)
        if (session.status !== 'complete')
            return next(new AppError('payment is not completed yet', 400))

        const order = await Order.findOne({ sessionId })
        if (!order) return next(new AppError('no order exits', 400))

        order.paymentStatus = 'completed'
        order.paymentIntentId = `${session.payment_intent}`
        await order.save({ validateBeforeSave: false })

        return response.status(200).json({
            status: 'order is created successfully',
            orderID: order?.id,
        })
    }
)

export const createOrderCheckOutSession = CatchAsync(
    async (
        request: RequestInterface,
        response: Response,
        next: NextFunction
    ) => {
        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
            await Promise.all(
                request.body.map(
                    async (productField: ProductFieldInterface) => {
                        const product = await Product.findById(productField.id)
                        if (!product)
                            return next(
                                new AppError(
                                    'product with this id no longer exists',
                                    400
                                )
                            )

                        return {
                            quantity: productField.quantity || 1,
                            price_data: {
                                currency: 'inr',
                                unit_amount: Number(product.price) * 100,
                                product_data: {
                                    name: product.title,
                                    description: limitString(
                                        product.description,
                                        20
                                    ),
                                    images: [
                                        `${request.protocol}://${request.get(
                                            'host'
                                        )}/public/images/product/${
                                            product.images[0]
                                        }`,
                                    ],
                                },
                            },
                        }
                    }
                )
            )

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${request.protocol}://${request.get(
                'host'
            )}/api/v1/orders/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'https://www.google.com',
            customer_email: request.user.email,
            line_items,
        })

        session.success_url = `${request.protocol}://${request.get(
            'host'
        )}/api/v1/orders/success?session_id=${session.id}`

        if (session.id)
            await Order.create({
                user: request.user.id,
                products: request.body.map(
                    (productField: ProductFieldInterface) => {
                        return {
                            product: productField.id,
                            quantity: productField.quantity,
                        }
                    }
                ),
                paymentStatus: 'pending',
                sessionId: session.id,
            })

        return response.json({
            session,
        })
    }
)

export const getMyOrders = CatchAsync(
    async (
        request: RequestInterface,
        response: Response,
        next: NextFunction
    ) => {
        request.query = { user: request.user.id }
        next()
    }
)

// REST HANDLERS
export const getAllOrders = getAll(Order)
export const getOder = getOne(Order)
export const createNewOrder = createOne(Order)
export const updateOrder = updateOne(Order)
export const deleteOrder = deleteOne(Order)
