const express = require('express')
const bookingController = require('../controllers/bookingController')
const authController = require('../controllers/authController')

const router = express.Router()

router.use(authController.protect)

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession)

router.use(authController.restrictTo('admin', 'lead-guide'))

router.route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking)

router.route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking)

module.exports = router

// exports.createBooking = factory.createOne(Booking)
// exports.getBooking = factory.getOne(Booking)
// exports.getAllBooking = factory.getAll(Booking)
// exports.updateBooking = factory.updateOne(Booking)
// exports.deleteBooking = factory.deleteOne(Booking)
