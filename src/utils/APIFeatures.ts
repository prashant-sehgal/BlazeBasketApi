import { Query } from 'mongoose'

class APIFeatures {
    constructor(public query: Query<any, any>, public queryObject: any) {}

    filter() {
        // converting request object to string and the adding $ sign in front of gt,gte,lte&lt and than it converted back to object to make it compatible with mongodb query string
        let queryObject = { ...this.queryObject }
        const excludedFileds = ['sort', 'fields', 'limit', 'page']
        excludedFileds.forEach((field) => delete queryObject[field])

        queryObject = JSON.parse(
            JSON.stringify(queryObject).replace(
                /\b(gte|gt|lte|lt)\b/g,
                (match) => `$${match}`
            )
        )

        this.query = this.query.find(queryObject)
        return this
    }

    sort() {
        if (this.queryObject.sort) {
            const sortString = String(this.queryObject.sort).replaceAll(
                ',',
                ' '
            )
            // console.log(sortString)
            this.query = this.query.sort(sortString)
        }
        return this
    }

    limitFields() {
        if (this.queryObject.fields) {
            const fieldString = this.queryObject.fields.replaceAll(',', ' ')
            this.query = this.query.select(fieldString)
        } else {
            this.query = this.query.select('-__v')
        }
        return this
    }

    pagination() {
        const page = this.queryObject.page * 1 || 1
        const limit = this.queryObject.limit * 1 || 100

        const skip = (page - 1) * limit

        this.query = this.query.skip(skip).limit(limit)

        return this
    }
}

export default APIFeatures
