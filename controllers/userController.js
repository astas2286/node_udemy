const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./../controllers/handlerFactory')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el]
        }
    })
    return newObj
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

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use Sign up instead'
    })
}

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)

//do not UPDATE password with this
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)