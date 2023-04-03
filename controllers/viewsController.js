const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')
const AppError = require('../utils/appError')
const cathcAsync = require('../utils/catchAsync')

exports.alerts = (req, res, next) => {
    const { alert } = req.query
    if (alert === 'booking')
        res.locals.alert = "Congrtas! You booking was successfull! If your booking doesn't show up here immidiatly, please come back later."

    next()
}

exports.getOverwiev = cathcAsync(async (req, res, next) => {
    //1) get all tour ata from collection
    const tours = await Tour.find()


    //2) build template

    //3)render template using tour data from point 1)
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
})

exports.getTour = cathcAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug })
        .populate({
            path: 'reviews',
            fields: 'review rating user'
        })

    if (!tour) {
        return next(new AppError('There is no tour with that name', 404))
    }
    res.status(200)
        .render('tour', {
            title: `${tour.name} Tour`,
            tour
        })
})

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log in to your accuont'
    })
}

exports.getSignUpForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Sign up'
    })
}

exports.getAccuont = (req, res) => {
    res.status(200).render('account', {
        title: 'Your accuont'
    })
}

exports.getMyTours = cathcAsync(async (req, res) => {
    //1) find all users bookings
    const bookings = await Booking.find({ user: req.user.id })
    //2) find all with the returned IDs

    const tourIDs = bookings.map(el => el.tour.id)
    const tours = await Tour.find({ _id: { $in: tourIDs } })

    res.status(200).render('overview', {
        title: 'My tours',
        tours
    })
})

exports.updateUserData = cathcAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    })

    res.status(200).render('account', {
        title: 'Your accuont',
        user: updatedUser
    })
})