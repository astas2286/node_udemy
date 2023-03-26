const multer = require('multer')
const sharp = require('sharp')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./../controllers/handlerFactory')

// cb is stands for callback
// this is to save the image on disk
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const extention = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${extention}`)
//     }
// })

// this is to save the image to buffer
const multerStorage = multer.memoryStorage()

// testing if uploading file is an image
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')


exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next()
})

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el]
        }
    })
    return newObj
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id  // to create endpoint where user can retive his own data
    next()
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
    if (req.file) filteredBody.photo = req.file.filename

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