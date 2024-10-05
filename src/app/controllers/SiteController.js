const Course = require('../models/Course')
const Categories = require('../models/Categories')
const { multipleMongooseToObject, mongooseToObject } = require('../../utill/mongoose')

class SiteController {



    // [GET] /
    index(req, res, next) {

        Promise.all([Categories.find({}), Course.find({}).populate([{ path: 'category' }, { path: 'catelist' }])])
            .then(function ([categories, courses]) {
                const countries = [...new Set(courses.map(courses => courses.countries))];
                const movieTheater = [...new Set(courses.map(courses => courses.catelist))]
                const movie = movieTheater[0]._doc['_id'];

                res.render('home', {
                    courses: multipleMongooseToObject(courses),
                    categories: multipleMongooseToObject(categories),
                    countries,
                    movie

                })

            })
            .catch(function (err) {
                // middle bắt lỗi khi không gửi lại được res tại 1 chỗ
                next(err);
            })

    }

    // [GET] /search
    search(req, res) {
        console.log(req.query.q)
        res.render('search')
    }
    // [GET] /:slug/genre
    genre(req, res, next) {
        Promise.all([Course.find({ category: req.params.id }).populate('category'), Categories.find({}), Course.find({}).populate('catelist')])
            .then(function ([courses, categories, course]) {
                const courseName = [...new Set(courses.map(courses => courses.category.name))];
                const countries = [...new Set(course.map(course => course.countries))];
                const movieTheater = [...new Set(course.map(course => course.catelist))]
                const movie = movieTheater[0]._doc['_id'];
                console.log(movie)
                res.render('user/genre/hanhdong', {
                    courses: multipleMongooseToObject(courses),
                    categories: multipleMongooseToObject(categories),
                    courseName: courseName,
                    countries,
                    course,
                    movie

                })
            })
            .catch(function (err) {
                next(err)
            })
    }
    // [GET] /site/country
    country(req, res, next) {

        Promise.all([Course.find({ countries: req.params.slug }), Categories.find({}), Course.find({}).populate('catelist')])
            .then(function ([course, categories, courses]) {
                const countries = [...new Set(courses.map(courses => courses.countries))];
                const countriesName = [...new Set(course.map(course => course.countries))];
                const movieTheater = [...new Set(courses.map(courses => courses.catelist))]
                const movie = movieTheater[0]._doc['_id'];
                res.render('user/country/countries', {
                    courses: multipleMongooseToObject(course),
                    categories: multipleMongooseToObject(categories),
                    countries,
                    countriesName,
                    movie
                })
            })
            .catch(function (err) {
                next(err)
            })
    }
    movieTheater(req, res, next) {
        Promise.all([Course.find({catelist: req.params.id }).populate('catelist'),Categories.find({}),Course.find({}).populate([{ path: 'category' }, { path: 'catelist' }])])
        .then(function([course,categories,courses]){
            const cateName = [...new Set(course.map(course => course.catelist.name))]
            const countries = [...new Set(courses.map(courses => courses.countries))];
            const movieTheater = [...new Set(courses.map(courses => courses.catelist))]
            const movie = movieTheater[0]._doc['_id'];
            res.render('user/category/movieTheater', {
                courses: multipleMongooseToObject(course),
                categories: multipleMongooseToObject(categories),
                cateName: cateName[0],
                countries,
                movie
            })
        })
        .catch(function (err) {
            next(err)
        })
    }



}

// tạo ra 1 đối tượng NewsController để export ra ngoài
module.exports = new SiteController();