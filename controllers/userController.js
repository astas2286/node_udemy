const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('../utils/appError')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) { 
            newObj[el] = obj[el] 
        }
    })
    return newObj
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet defined'
    })
}

exports.updateMe = catchAsync(async (req, res, next) => {
    //1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError(
            'This route is not for updating password. Use /updateMyPassword instead',
            400))
    }
    //2) filter out fields that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email')

    //3) update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    }) // we can use findByIdAndUpdate because we are already logged in

    res.status(200).json({
        status: 'succsess',
        data: {
            user: updatedUser
        }
    })
})

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet defined'
    })
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet defined'
    })
}

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet defined'
    })
}