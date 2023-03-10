const express = require('express')
const viewsController = require('../controllers/viewsController')

const router = express.Router()

router.get('/', viewsController.getOverwiev)
router.get('/tour/:slug', viewsController.getTour)
router.get('/login', viewsController.getLoginform)

module.exports = router
