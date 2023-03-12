const express = require('express')
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')

const router = express.Router()

// all middlewares are for authenticated users only, thats why we call authController.isLoggedIn here
router.use(authController.isLoggedIn)

router.get('/', viewsController.getOverwiev)
router.get('/tour/:slug', viewsController.getTour)
router.get('/login', viewsController.getLoginForm)

module.exports = router
