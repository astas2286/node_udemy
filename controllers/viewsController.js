const Tour = require('../models/tourModel')
const cathcAsync = require('../utils/catchAsync')

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