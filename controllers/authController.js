const {
    promisify
} = require('util') // promisify if built in NODE function to handle promises
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

const signToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}


exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body
        //     {
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: req.body.password,
        //     passwordConfirm: req.body.passwordConfirm
        // }
    )

    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body

    //1) Check if password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    //2) Check if user exists && pass is correct
    const user = await User.findOne({
        email
    }).select('+password')

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401))
    }
    //3)If everything is OK, send token to client
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    //1) Getting the token and check if it`s there
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access!', 401))
    }
    //2) token verification
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // There are two sets of brackets because this part:
    // promisify(jwt.verify) Returns the promisified version of jwt.verify as a function and this part:
    // (token, process.env.JWT_SECRET) Executes that function.

    //3) check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
        return next(new AppError('The token does no longer exists!', 401))
    }
    //4) Check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed passport, Please login again!', 401))
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser
    next()
})

exports.restrictTo = (...roles) => {
    return (req,res,next) =>{
        //roles is an array ['admin', 'lead-guide']
        if(!roles.includes(req.user.role)){
            return next(new AppError('You have no permission for this action!', 403))
        }
        next()
    }
}