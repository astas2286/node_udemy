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

    if (process.env === 'development') {
        sendErrorDev(err, res)
    } else if (process.env === 'production') {
        sendErrorProd(err, res)
    }
}