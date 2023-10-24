import multer from 'multer'
import { RequestInterface } from './models/interfaces/RequestInterface'

export const productImagesStorage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, `${__dirname}/../public/images/product/`)
    },
    filename: function (request, file, cb) {
        const ext = file.mimetype.split('/')[1]
        const fileName = `product-${Date.now()}-${Math.round(
            Math.random() * 1_000_000
        )}.jpg`

        if (request.body.images)
            request.body.images = [...request.body.images, fileName]
        else request.body.images = [fileName]

        cb(null, fileName)
    },
})

export const profileImagesStorage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, `${__dirname}/../public/images/profile/`)
    },
    filename: function (request: RequestInterface, file, cb) {
        const fileName = `profile-${request.user.id}-${Date.now()}.jpg`
        request.body.image = fileName

        cb(null, fileName)
    },
})
