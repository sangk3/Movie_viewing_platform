//  tách route sử dụng route.use() cấu hình route

const express = require('express');
// sử dụng phương thức Router của express để định nghĩa tuyến đường
const router = express.Router();
const courseController = require("../app/controllers/CourseController")

// newsController.index 
router.get('/create',courseController.create);

// cấp route con của /news trỏ về news/path-con-... với phương thức get
router.get('/:slug',courseController.show)
// cấp route con của /news cấu hình param của /news với phương thức get

// router là 1 object cho phép quản lý các route
module.exports = router;