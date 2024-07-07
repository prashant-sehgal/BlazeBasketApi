import { Router } from 'express'
import multer from 'multer'
import * as productController from '../controllers/productController'
import { authenticate, authorizedTo } from '../controllers/authController'
import { productImagesStorage, resizeImage } from '../storage'

const upload = multer({ storage: productImagesStorage })

const router = Router()

// open routes
router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProduct)
router.get('/search/:query', productController.searchAllProducts)

// authencticated and restricted routes for admin
router.use(authenticate)
router.use(authorizedTo('admin'))

router.post(
    '/',
    upload.array('product-image', 5),
    productController.createNewProduct
)

router
    .route('/:id')
    .patch(
        upload.array('product-image', 5),
        resizeImage,
        productController.updateProduct
    )
    .delete(productController.deleteProduct)

export default router
