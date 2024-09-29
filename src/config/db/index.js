// connect to mongodb
// sử dụng await trong function thì function đó phải lầ async và có try CATCH


const mongoose = require('mongoose');
async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/F8_course_dev');
        console.log('connect success')
    } catch (error) {
        console.log('connect error')
    }

}

module.exports = { connect };