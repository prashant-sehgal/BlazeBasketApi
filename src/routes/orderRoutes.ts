import { Router } from 'express'
import * as orderController from '../controllers/orderController'
import { authenticate, authorizedTo } from '../controllers/authController'

const router = Router()

// open route
router.get('/success', orderController.checkoutSuccess)

// authenticated routes
router.use(authenticate)

router.post('/checkout', orderController.createOrderCheckOutSession)
router.post(
    '/getMyOrders',
    orderController.getMyOrders,
    orderController.getAllOrders
)

// restricted routes
router.use(authorizedTo('admin'))
router
    .route('/')
    .get(orderController.getAllOrders)
    .post(orderController.createNewOrder)

router
    .route('/:id')
    .get(orderController.getOder)
    .patch(orderController.updateOrder)
    .delete(orderController.deleteOrder)

export default router
