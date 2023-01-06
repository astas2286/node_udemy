const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name!'],
    unique: true,
    trim: true,
    maxLength: [40, 'A tour name must have less or equal then 40 characters'],
    minLength: [10, 'A tour name must have more or equal then 10 characters']
    // validate: [validator.isAlpha, 'Name must contain characters only!'] does not pass spaces either
  },

  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration!'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size!'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty!'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be less 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price!']
  },
  priceDiscount: {
    type: Number,
    // will work when you creating document but not for update
    validate: {
      message: 'Discount price {VALUE} should be below regular price',
      validator: function (val) {
        return val < this.price
      }
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description!']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image!']
  },
  images: [String],
  createsAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
})

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true
  })
  next()
})

// tourSchema.pre('save', function(next){
//   console.log('will save doc...')
//   next()
// })

// tourSchema.post('save', function (doc, next) {
// console.log(doc);
//   next()
// })

//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) { we use regexp /^find/ to use middleware for all commands with 'find' (findOne, findOneAndDelete etc.)
  this.find({
    secretTour: {
      $ne: true
    }
  })
  this.start = Date.now()
  next()
})

tourSchema.post(/^find/, function (docs, next) {
  next()
})

// AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true
      }
    }
  })

  console.log(this.pipeline());
  next()
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour