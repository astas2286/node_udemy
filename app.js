const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1 - GLOBAL MIDDLEWARES
// serving statis files
app.use(express.static(path.join(__dirname, 'public')));

// setting security HTTP headers
app.use(helmet())

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit reqests to 100 requests per hour from the same IP (to avoid ddos atacks)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later '
})
app.use('/api', limiter)

// body parser, to read data from body to req.body
app.use(express.json({ limit: '10kb' })); // we can limit size of body

// data sanitization against NoSQL query injections
app.use(mongoSanitize())
// data sanitization against XSS
app.use(xss())

// prevent parameter pollution (if query is ?sort=duration&sort=price will sort only for the last paramter: price)
app.use(hpp({
  whitelist: ['duration', 'maxGroupSize', 'ratingsAverage', 'ratingsQuantity', 'price', 'difficulty']
}))

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});
// 3) ROUTES
app.get('/', (req, res) => {
  res.status(200).render('base')
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// code below must be in the end of the code to correctly catch all URLs
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app;