const express = require('express')
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')

const router = express.Router()

router.get('/', authController.isLoggedIn, viewsController.getOverwiev)
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour)
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm)
router.get('/me', authController.protect, viewsController.getAccuont)

module.exports = router
