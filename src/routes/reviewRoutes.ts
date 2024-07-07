import { Router } from 'express'
import { authenticate, authorizedTo } from '../controllers/authController'
import {
    createFilterObject,
    createNewReview,
    createReviewObject,
    deleteReview,
    filterProductReviews,
    getAllReviews,
    getReview,
    updateReview,
} from '../controllers/reviewController'

const router = Router()

router.route('/product/:id').get(filterProductReviews, getAllReviews)

router.use(authenticate)

router
    .route('/myReviews')
    .get(createFilterObject, getAllReviews)
    .post(createReviewObject, createNewReview)

// restricter routes for admin
router.use(authorizedTo('admin'))

router.route('/').get(getAllReviews).post(createNewReview)
router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview)

export default router
