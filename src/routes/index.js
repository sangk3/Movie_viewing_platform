// import toàn bộ route trong index.js
const siteRoute = require('./sites');
const courseRoute = require('./courses');
const adminRoute = require("./admin");
const authRoute = require("./auth");
const userRoute = require("./user");
function route(app) {

    app.use('/courses', courseRoute);
    app.use('/admin', adminRoute);
    app.use('/auth', authRoute);
    app.use('/user',userRoute);
    app.use('/', siteRoute)
    


}
module.exports = route;