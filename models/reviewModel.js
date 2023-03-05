const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    rewiev: {
        type: String,
        required: [true, 'Please write something']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user:
    {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    },
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name' //to include only name
    // }).populate({
    //     path: 'user',
    //     select: 'name photo' //to include only name & photo
    // })

    this.populate({
            path: 'user',
            select: 'name photo' //to include only name & photo
        })
    next()
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review