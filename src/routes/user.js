const express = require('express');
// sử dụng phương thức Router của express để định nghĩa tuyến đường
const router = express.Router();
const userController = require("../app/controllers/UserController")
const authMiddleware = require("../app/middleware/authMiddleware")

router.delete('/:id',authMiddleware.verifyTokenAdminAuth,userController.deleteUser)
// show form đăng ký
router.get('/',authMiddleware.verifyToken,userController.getAllUsers)
module.exports = router