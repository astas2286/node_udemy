const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
    const message = `Duplicate field value ${value}. Please use another name`
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)

    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid token, please log in again', 401)
const handleJWTExpiredError = ()=> new AppError('Token has been expired, please log in again', 401)

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    // Operational error(we know what is going wrong): send message to the client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        // Programming error (unknown): don`t leak error to the client
        // 1) Log an error to see what is going wrong
        console.error('ERROR CARRAMBA!!!', err);
        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        })
    }
}
module.exports = (err, req, res, next) => {
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = Object.assign(err)
        if (err.name === 'CastError') error = handleCastErrorDB(error)
        if (err.code === 11000) error = handleDuplicateFieldsDB(error)
        if (err._message === 'Validation failed') error = handleValidationErrorDB(error)
        if (err.name === 'JsonWebTokenError') error = handleJWTError()
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError()
        sendErrorProd(error, res)
    }
}