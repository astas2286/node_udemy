const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')

const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

router.use(authController.protect) // we start authController.protect to protect all middlewares below 
// if user is not authinticated then middlewares below won`t be called

router.patch('/updateMyPassword', authController.updatePassword)
router.get('/me', userController.getMe, userController.getUser)
router.patch('/updateMe', userController.uploadUserPhoto, userController.updateMe)
router.delete('/deleteMe', userController.deleteMe) //user is actually not deleted, but it`s ok to use DELETE http method here

router.use(authController.restrictTo('admin')) // allows only to admin to use routes bellow

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router