import { Router } from 'express'
import * as authController from '../controllers/authController'
import * as userController from '../controllers/userController'
import multer from 'multer'
import { profileImagesStorage } from '../storage'

const router = Router()
const upload = multer({ storage: profileImagesStorage })

// open routes
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forgotPassword', authController.forgotPassword)
router.post('/resetPassword', authController.resetPassword)

// authenticated routes
router.use(authController.authenticate)
router.route('/updateMyPassword').post(userController.updateMyPassword)
router.route('/updateMe').post(upload.single('image'), userController.updateMe)

// restricted users routes for admin user
router.use(authController.authorizedTo('admin'))

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createNewUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

export default router
