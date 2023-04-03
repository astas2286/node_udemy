const path = require('path')
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const crypto = require('crypto')
const compression = require('compression')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const bookingController = require('./controllers/bookingController')
const viewRouter = require('./routes/viewRoutes')
const { application } = require('express')

const app = express()

app.enable('trust proxy')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1 - GLOBAL MIDDLEWARES
// serving statis files
app.use(express.static(path.join(__dirname, 'public')))

/* Implement CORS */
// use cors before all route definitions
app.use(cors())
// app.use(cors({ origin: 'http://127.0.0.1:8000', credentials: 'true' }))

// To allow complex requests like PUT, PATCH, DELETE
app.options('*', cors())

// setting security HTTP headers
// app.use(helmet()) //- helmet itself is blocking API request
const scriptSrcUrls = [
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.min.js',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://js.stripe.com/v3/'
]
const styleSrcUrls = [
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.min.js',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://js.stripe.com/v3/'
]
const connectSrcUrls = [
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.min.js',
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
  'https://js.stripe.com/v3/'
]

// If you need to include inline scripts in your application, you can use the nonce parameter to allow only scripts that include a specific nonce value.
// Generate a random 16-byte value
const nonceBytes = crypto.randomBytes(16)
// Convert the bytes to a Base64-encoded string
const someNonceValue = nonceBytes.toString('base64')

const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com']
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ['http:'],
      connectSrc: ["'self'", 'http:', 'https:', 'ws:', ...connectSrcUrls],
      scriptSrc: ["'self'", "'unsafe-inline'", `nonce-${someNonceValue}`, ...scriptSrcUrls],
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

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
)

// body parser, to read data from body to req.body
// we can limit size of body
app.use(express.json({ limit: '10kb' }))

//this added to parse data when we update user on route 'submit-user-data'
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

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

app.use(compression())

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  // console.log(req.cookies)
  next()
})

// 3) ROUTES
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/bookings', bookingRouter)
app.use('/api/v1/reviews', reviewRouter)

// code below must be in the end of the code to correctly catch all URLs
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app