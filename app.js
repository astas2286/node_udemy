const path = require('path')
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1 - GLOBAL MIDDLEWARES
// serving statis files
app.use(express.static(path.join(__dirname, 'public')))

// setting security HTTP headers
// app.use(helmet()) //- helmet itself is blocking API request
const scriptSrcUrls = [
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.min.js',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
]
const styleSrcUrls = [
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.min.js',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
]
const connectSrcUrls = [
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.min.js',
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
]
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com']
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
)


//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

//Limit reqests to 100 requests per hour from the same IP (to avoid ddos atacks)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later '
})
app.use('/api', limiter)

// body parser, to read data from body to req.body
app.use(express.json({ limit: '10kb' })) // we can limit size of body
// cookieParser is for parsing cookie
app.use(cookieParser())

// data sanitization against NoSQL query injections
app.use(mongoSanitize())
// data sanitization against XSS
app.use(xss())

// prevent parameter pollution (if query is ?sort=duration&sort=price will sort only for the last paramter: price)
app.use(hpp({
  whitelist: [
    'duration',
    'maxGroupSize',
    'ratingsAverage',
    'ratingsQuantity',
    'price',
    'difficulty'
  ]
}))

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  console.log(req.cookies)
  next()
})

// 3) ROUTES
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

// code below must be in the end of the code to correctly catch all URLs
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app