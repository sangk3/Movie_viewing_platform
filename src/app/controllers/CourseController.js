const Course = require('../models/Course')
const { multipleMongooseToObject, mongooseToObject } = require('../../utill/mongoose')

class CourseController {

    // [GET] /courses/:slug
    show(req, res, next) {
        // slug là /:param req.params.</:route_name>
        // slug chỉ là 1 field của collection
        // query parameters dùng khi submit form
        Course.findOne({ slug: req.params.slug })
            .then(function (course) {
                // res.json(course);
                res.render('courses/show', {
                    course: mongooseToObject(course)
                })
 
            })
            .catch(function (err) {
                next(err)
            })

    }

    // logic handle for create course
    create(req, res, next) {
        res.render('courses/create')
    }


    // [POST] /courses/store


}

// tạo ra 1 đối tượng NewsController để export ra ngoài
module.exports = new CourseController();