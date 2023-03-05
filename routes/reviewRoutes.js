const express = require('express')
const reviewController = require('../controllers/reviewController')
const authController = require('./../controllers/authController')

const router = express.Router({ mergeParams: true }) // to merge review route to tour route

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    )

router
    .route('/:id')
    .delete(reviewController.deleteReview)
    .patch(reviewController.updateteReview)

module.exports = router