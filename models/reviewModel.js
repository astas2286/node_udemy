const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    review: {
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

    // each combination of tour+user will be allways unique
    // it will help to prevent duplicate reviews from one user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }) 

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

// aggregator to calculate average rating and number of ratings
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        // to set default values if all reviews were deletesd
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }

}

reviewSchema.post('save', function () {
    //this points to current review
    // we use this.constructor because Rewiev variable is not yet defined 
    //we use .post instead of pre to count this last review too
    this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne()
    next()
})

reviewSchema.post(/^findOneAnd/, async function () {
    // await this.findOne() does NOT works here because the query if already executed when we on .post method
    await this.r.constructor.calcAverageRatings(this.r.tour)
})
const Review = mongoose.model('Review', reviewSchema)

module.exports = Review