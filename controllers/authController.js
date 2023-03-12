const crypto = require('crypto')
const { promisify } = require('util') // promisify if built in NODE function to handle promises
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email')

const signToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true // to send cookie via encrypted connection using https

    res.cookie('jwt', token, cookieOptions)

    user.password = undefined // to remove the password from output

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create(req.body) // unsafe
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })
    createSendToken(newUser, 201, res)
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
    createSendToken(user, 200, res)
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
}

exports.protect = catchAsync(async (req, res, next) => {
    //1) Getting the token and check if it`s there
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
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
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed passport, Please login again!', 401))
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser
    next()
})

//Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1)verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            )

            //2) check if user still exists
            const currentUser = await User.findById(decoded.id)
            if (!currentUser) {
                return next()
            }

            //3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next()
            }

            //there is a logged in user
            res.locals.user = currentUser
            return next()
        }
        catch (err) {
            return next()
        }
    }
    //if there is no cookie - there is no user logged and next middleware will be call rightaway
    next()
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is an array ['admin', 'lead-guide'] thats why we need to use closer
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You have no permission for this action!', 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('There is no user with that email!', 404))
    }

    //2)Generate the random token
    const resetToken = user.createPasswordResetToken()

    await user.save({ validateBeforeSave: false }) // this turns off all validators

    //3)Send it to user
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n
    If you didn't forget your password ignore this email`
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token is valid for 10 minutes',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined

        await user.save({ validateBeforeSave: false })

        return next(new AppError('There was an error sending email! Try again later', 500))
    }

})

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })

    //2) if token has not expired and there is the user - set the password
    if (!user) {
        return next(new AppError('Token is not valid or has expired', 400))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
    //3) update changed pass

    //4) log the user in, send JWT
    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) get user from the collection
    const user = await User.findById(req.user.id).select('+password') // "+" is to get password visible

    //2) check if posted password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Password is incorrect', 401))
    }
    //3) update the password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    //4) log in user, send JWT
    createSendToken(user, 200, res)
})