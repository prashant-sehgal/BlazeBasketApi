import multer from 'multer'
import sharp from 'sharp'
import { Request, Response, NextFunction } from 'express'
import { RequestInterface } from './models/interfaces/RequestInterface'
import CatchAsync from './utils/CatchAsync'

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

export const resizeImage = CatchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
        const files: any = request.files
        files.forEach(async (file: any) => {
            const buffer = await sharp(`${file.path}`).toBuffer()

            sharp(buffer)
                .resize({
                    width: 500,
                    height: 400,
                    fit: 'fill',
                })
                .toFile(`${file.path}`)
        })
        next()
    }
)
