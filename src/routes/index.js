// import toàn bộ route trong index.js
const siteRoute = require('./sites');
const courseRoute = require('./courses');
const adminRoute = require("./admin");
const authRoute = require("./auth");
const userRoute = require("./user");
const viewerRoute = require("./viewer");
function route(app) {

    app.use('/courses', courseRoute);
    app.use('/admin', adminRoute);
    app.use('/auth', authRoute);
    app.use('/user',userRoute);
    app.use('/viewer', viewerRoute);
    app.use('/', siteRoute)
    


}
module.exports = route;