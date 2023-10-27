import mongoose from 'mongoose'
import { UserInterface } from './userModel'

interface OrderInterface {
    user: string
    products: string[]
    paymentStatus: 'pending' | 'completed'
    paymentIntentId: string
    sessionId: string
}

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'order must belong to a user'],
    },
    products: {
        type: [
            {
                product: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Product',
                    requried: [true, 'order must contain one or more products'],
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
    },
    paymentIntentId: String,
    sessionId: String,
    completed: {
        type: Boolean,
        default: false,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

orderSchema.pre(/^find/, function (this: any) {
    this.populate({
        path: 'user',
        select: 'name email image',
    })
    this.populate({
        path: 'products.product',
        select: 'title price images',
    })
})

const Order = mongoose.model<OrderInterface>('Order', orderSchema)
export default Order
