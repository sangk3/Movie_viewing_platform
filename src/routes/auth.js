const express = require('express');
// sử dụng phương thức Router của express để định nghĩa tuyến đường
const router = express.Router();
const authController = require("../app/controllers/authController")

// show form đăng ký
router.get('/register',authController.showRegister)
router.get('/login',authController.showLogin)
// Kiểm tra thông tin đăng nhập

router.post('/checklogin',authController.loginUser)
// đăng kí tài khoản 
router.post('/create',authController.createUser)
// refresh token
router.post('/refresh',authController.requestRefreshToken)

module.exports = router