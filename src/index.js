// sử dụng require yêu cầu thư viện expres trong node modules
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const route = require('./routes/index.js');
const db = require('./config/db')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const sort = require('./app/middleware/sortMiddleware')
const dotenv = require('dotenv');
const Categories = require('./app/models/Categories.js');
// connect to database
db.connect();
dotenv.config();
const app = express();
// run server ở cổng nào
const port = 3000;

app.use(methodOverride('_method'))
// sử dụng các file tĩnh bằng path.join (localhost:3000/img/download.png)
app.use(express.static(path.join(__dirname, 'public')))
// tạo cookie và gắn cookie
app.use(cookieParser())
// HTTP logger dạng cổ điển combined
app.use(morgan('combined'));


// middleware xử lý dữ liệu khi được gửi lên khi submit form và lưu vào body
// nên để sử dụng req.body cần sử dụng middleware
app.use(express.urlencoded({
  extended: true
}));

// middleware xử lý khi được gửi từ code javascript lên
app.use(express.json());

// custom middleware
app.use(sort)


// template engine
app.engine('hbs', engine({
  extname: '.hbs',
  // giúp tạo ra function trong express-handlebars
  // nhân của express-handlebars là handlebars
  helpers: {
    sum(a, b) { return a + b; },
    uniqueCategories: function (categories) {
      // Loại bỏ những phần tử không hợp lệ (null, undefined, không phải chuỗi)
      const validCategories = categories.filter(category => typeof category === 'string');
      // Chuyển đổi tất cả các giá trị danh mục về chữ thường
      const lowerCaseCategories = validCategories.map(category => category.toLowerCase());
      // Loại bỏ giá trị trùng lặp
      const uniqueValues = [...new Set(lowerCaseCategories)];
      // Trả về các giá trị đã lọc
      return uniqueValues.map(value => {
        const originalCategory = categories.find(category => category && category.toLowerCase() === value);
        return originalCategory;
      });
    },
    notEqual: function (a, b) {
      return a !== b;
    },
    eq: function (a, b) {
      return a === b;
    },
    sort: function (field, sortObj) {
      const sortType = field === sortObj.column ? sortObj.type : 'default'
      const icons = {
        default: 'fa-solid fa-arrows-up-down',
        desc: 'fa-solid fa-arrow-down-wide-short',
        asc: 'fa-solid fa-arrow-down-short-wide'
      }
      const types = {
        default: 'desc',
        asc: 'desc',
        desc: 'asc'
      }
      const icon = icons[sortType]
      const type = types[sortType]

      return `<a href="?_sort&column=${field}&type=${type}">
      <i class="${icon}"></i></a>`
    },
    countryName: function (code) {
      const countryMap = {
        'han-quoc': 'Hàn Quốc',
        'hong-kong': 'Hồng Kông',
        'nhat-ban': 'Nhật Bản',
        'thai-lan': 'Thái Lan',
        'trung-quoc': 'Trung Quốc',
        'tong-hop': 'Tổng Hợp',
        'viet-nam': 'Việt Nam',
        'au-my': 'Âu Mỹ',
        'dai-loan': 'Đài Loan',
      }
      return countryMap[code]
    },
    toUpper: function (str) {
      return str.toUpperCase()
    },
    change:function(isAdmin){
      if(isAdmin){
        return 'Admin'
      }
      else{
        return 'Staff'
      }
    },
    movieRender: function(movie){
      
      const category={
      'phim chiếu rạp': 'phim-chieu-rap'
      }
      return category[movie]
      
    }


  }
}));
app.set('view engine', 'hbs');
// thiết lập đường dẫn đến folder views. NodeJs tìm kiếm trong views để server render
//  theo tempalte engine
app.set('views', path.join(__dirname, 'resources', 'views'));


// Route init: Khởi tạo tuyến đường
route(app);


app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})