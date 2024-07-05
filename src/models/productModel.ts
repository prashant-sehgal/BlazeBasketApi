import mongoose from 'mongoose'
import slugify from 'slugify'

export interface ProductInterface {
    title: string
    description: string
    price: number
    ratingsAverage: number
    recommended: boolean
    images: string[]
    slug: string
    createdAt: number
}

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'product must have a title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'product must have a description'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'product must have a price'],
    },
    category: {
        type: String,
        enum: ['laptop', 'smartphone', 'smartwatch', 'headphone', 'speakers'],
        required: true,
    },
    ratingsAverage: {
        type: Number,
        max: [5.0, 'ratings must be equal or below 5.0'],
        min: [1.0, 'ratings must be equal or above 1.0'],
        default: 3.0,
    },
    recommended: {
        type: Boolean,
        default: false,
    },
    images: [String],
    slug: String,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

productSchema.pre('save', function (this) {
    this.slug = slugify(this.title)
})

const Product = mongoose.model<ProductInterface>('Product', productSchema)
export default Product
