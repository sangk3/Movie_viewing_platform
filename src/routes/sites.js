//  route của các trang khác như home,search,contact...

const express = require('express');
// sử dụng phương thức Router của express để định nghĩa tuyến đường
const router = express.Router();
const siteController = require("../app/controllers/SiteController")

// newsController.index 

// cấp route con của / trỏ về news/path-con-...
router.get('/search',siteController.search);
router.get('/genre/:id',siteController.genre);
router.get('/country/:slug',siteController.country);
// get phim chiếu rạp
router.get('/category/:id',siteController.movieTheater);
router.get('/',siteController.index);

module.exports = router;