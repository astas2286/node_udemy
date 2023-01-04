const {
    query
} = require('express')
const Tour = require('./../models/tourModel')

exports.getAllTours = async (req, res) => {

    try {
        // HERE WE BUILD QUERY
        // 1a) Filtering
        const queryObj = {
            ...req.query
        }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])

        // 1b) Advanced Filtering
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        let query = Tour.find(JSON.parse(queryStr))

        // 2) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        } else {
            query = query.sort('-createsAt')
        }

        // 3) Fields limit
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ')
            query = query.select(fields)
        } else {
            query = query.select('-__v')
        }
        // to exclude something just use '-'

        // 4) Pagination
        const page = req.query.page * 1 || 1
        const limit = req.query.limit * 1 || 100
        const skip = (page - 1) * limit

        query = query.skip(skip).limit(limit)

        if (req.query.page) {
            const numberOfTours = await Tour.countDocuments()
            if (skip >= numberOfTours) throw new Error('No more tours are available!')
        }

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