const express = require('express');
const ViewerController = require('../app/controllers/ViewerController')
// sử dụng phương thức Router của express để định nghĩa tuyến đường
const router = express.Router();

router.get('/login',ViewerController.showLogin)
router.get('/register',ViewerController.showRegister)
router.post('/createViewer',ViewerController.createViewer)
module.exports = router