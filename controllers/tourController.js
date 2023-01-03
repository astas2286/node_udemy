const {
    query
} = require('express')
const Tour = require('./../models/tourModel')

exports.getAllTours = async (req, res) => {

    try {
// HERE WE BUILD QUERY
        const queryObj = {
            ...req.query
        }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])

        console.log(req.query, queryObj)

        const query = Tour.find(queryObj)

        // const tours = await Tour.find({
        //     duration: 5,
        //     difficulty: 'easy'
        // })

        // const tours = await Tour.find()
        // .where('duration')
        // .equals(5)
        // .where('difficulty')
        // .equals('easy')
        // HERE WE EXECUTE QUERY
        const tours = await query

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)

        res.status(200).json({
            status: 'success',
            data: {
                tours: tour
            }
        })

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.createTour = async (req, res) => {
    try {
        // const newTour = new Tour({ ...some data})
        // newTour.save() but instead we crate async function below

        const newTour = await Tour.create(req.body)

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })

    }
}

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id)
        // don`t need to save in a const, we don`t send anything to the client
        res.status(204).json({
            status: 'success',
            data: null
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })

    }
}