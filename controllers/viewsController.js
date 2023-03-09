
const Tour = require('../models/tourModel')
const cathcAsync = require('../utils/catchAsync')

exports.getOverwiev = cathcAsync(async (req, res) => {
    //1) get all tour ata from collection
    const tours = await Tour.find()


    //2) build template

    //3)render template using tour data from point 1)
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
})

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour'
    })
}