const Course = require('../models/Course')
const Categories = require('../models/Categories')
const User = require('../models/User')
const CateList = require('../models/CateList')
const { multipleMongooseToObject, mongooseToObject } = require('../../utill/mongoose')

class AdminController {


    check(req, res, next) {
        res.json({ username: req.user.username });
    }
    show(req, res, next) {
        if (req.query.username) {
            const username = atob(req.query.username)

            res.render('admin', {
                layout: 'mainadmin',
                username
            })
        }
        else {
            res.render('admin/login/login', {
                layout: 'login'
            })
        }

    }

    // logic handle for create course
    create(req, res, next) {
        Promise.all([Categories.find({}),CateList.find({})])
        .then(function([category,catelist]){
            const categorieName = [...new Set(category.map(category => category.name))];
            const catelistName =[...new Set(catelist.map(catelist => catelist.name))]
            res.render('courses/create', {
                layout: 'mainadmin',
                categories: multipleMongooseToObject(category),
                catelist:multipleMongooseToObject(catelist),
                name: [categorieName,catelistName]
            })
        })


        Categories.find({})
            .then(function (category) {
                const categorieName = [...new Set(category.map(category => category.name))];
                res.render('courses/create', {
                    layout: 'mainadmin',
                    categories: multipleMongooseToObject(category),
                    name: categorieName
                })
            })
            .catch(function (err) {
                next(err);
            })

    }

    // [GET]/admin/create/category
    createCategory(req, res, next) {
        res.render('categories/create', { layout: 'mainadmin' })
    }

    createCateList(req, res, next) {
        res.render('admin/catelist/create', {
            layout: 'mainadmin'
        })
    }


    // [POST] /courses/store
    store(req, res, next) {
        //  Tạo ra biến mới formData giống như formData của post để insert thêm fields

        req.body.image = `https://img.youtube.com/vi/${req.body.videoid}/sddefault.jpg`
        const course = new Course(req.body)
        // dùng để lưu vào database
        course.save()
            .then(function () {
                // chuyển hướng trang khi save success
                res.redirect('/admin/stored/courses')

            })
            .catch(function (err) {

            });
    }

    // [POST]/admin/create/store
    storeCategory(req, res, next) {
        // Chuyển tên thể loại thành chữ thường để kiểm tra và lưu vào cơ sở dữ liệu
        const categoryNameLowerCase = req.body.name.toLowerCase();

        // Tìm thể loại theo tên không phân biệt chữ hoa/chữ thường
        Categories.findOne({ name: new RegExp('^' + categoryNameLowerCase + '$', 'i') })
            .then(function (category) {
                if (category) {
                    // Nếu thể loại đã tồn tại, trả về thông báo lỗi
                    res.render('categories/create', {
                        layout: 'mainadmin',
                        error: 'Thể loại đã tồn tại',
                        formData: req.body, // Giữ lại dữ liệu đã nhập
                    });
                } else {
                    // Nếu thể loại chưa tồn tại, tiến hành lưu vào database với tên viết thường
                    const newCategory = new Categories({
                        name: categoryNameLowerCase, // Lưu tên thể loại về chữ thường
                        description: req.body.description
                    });
                    return newCategory.save()
                        .then(function () {
                            res.redirect('/admin/stored/category');
                        });
                }
            })
            .catch(function (err) {
                next(err);
            });
    }


    storedCategory(req, res, next) {

        Promise.all([Categories.find({}), Categories.countDocumentsWithDeleted({ deleted: true })])
            // viết theo destructuring bình thường trả về 1 result là 1 mảng kết quả của 2 promises
            .then(function ([categories, deleteCategories]) {
                res.render('categories/stored-category', {
                    layout: 'mainadmin',
                    categories: multipleMongooseToObject(categories),
                    deleteCategories: deleteCategories
                })
            })
            .catch(function (err) {
                next(err)
            })
    }

    // [POST] /admin/store/catelist
    storeCateList(req, res, next) {
        const categoryNameLowerCase = req.body.name.toLowerCase();

        // Tìm thể loại theo tên không phân biệt chữ hoa/chữ thường
        CateList.findOne({ name: new RegExp('^' + categoryNameLowerCase + '$', 'i') })
            .then(function (catelist) {
                if (catelist) {
                    // Nếu thể loại đã tồn tại, trả về thông báo lỗi
                    res.render('admin/catelist/create', {
                        layout: 'mainadmin',
                        error: 'danh mục đã tồn tại',
                        formData: req.body, // Giữ lại dữ liệu đã nhập
                    });
                } else {
                    // Nếu thể loại chưa tồn tại, tiến hành lưu vào database với tên viết thường
                    const newCategory = new CateList({
                        name: categoryNameLowerCase, // Lưu tên thể loại về chữ thường
                        description: req.body.description
                    });
                    return newCategory.save()
                        .then(function () {
                            res.redirect('/admin/stored/catelist');
                        });
                }
            })
            .catch(function (err) {
                next(err);
            });
    }


    // [GET] /admin/stored/catelist
    storedCateList(req, res, next) {
        Promise.all([CateList.find({}), CateList.countDocumentsWithDeleted({ deleted: true })])
            // viết theo destructuring bình thường trả về 1 result là 1 mảng kết quả của 2 promises
            .then(function ([catelist, deleteCategories]) {
                res.render('admin/catelist/stored-catelist', {
                    layout: 'mainadmin',
                    catelist: multipleMongooseToObject(catelist),
                    deleteCategories: deleteCategories
                })
            })
            .catch(function (err) {
                next(err)
            })
    }

    // [GET] /admin/stored/courses
    storedCourses(req, res, next) {

        // search 


        let courseQuery = Course.find({})
        if (req.query.hasOwnProperty('_sort')) {
            courseQuery = courseQuery.sort({
                [req.query.column]: req.query.type
            })

        }
        // search
        let searchTerm = req.query.search || '';  // Lấy search term từ query hoặc để trống nếu không có
        let query = {};

        // Nếu có searchTerm, thêm điều kiện tìm kiếm theo tên phim, quốc gia và thể loại
        if (searchTerm) {
            // Tìm kiếm theo tên, quốc gia (countries), và thể loại phim (category)
            Categories.find({ name: new RegExp(searchTerm, 'i') })  // Tìm thể loại theo search term
                .then((foundCategories) => {
                    const categoryIds = foundCategories.map(category => category._id);
                    query.$or = [
                        { name: new RegExp(searchTerm, 'i') },        // Tìm kiếm theo tên phim
                        { countries: new RegExp(searchTerm, 'i') },   // Tìm kiếm theo quốc gia
                        { category: { $in: categoryIds } }            // Tìm kiếm theo thể loại
                    ];

                    // Tiếp tục với query của Course
                    let courseQuery = Course.find(query).populate('category');

                    // Nếu có yêu cầu sắp xếp (sorting)
                    if (req.query.hasOwnProperty('_sort')) {
                        courseQuery = courseQuery.sort({
                            [req.query.column]: req.query.type
                        });
                    }

                    // Sử dụng Promise.all để thực hiện đồng thời việc tìm kiếm và đếm số khóa học bị xóa
                    return Promise.all([courseQuery, Course.countDocumentsWithDeleted({ deleted: true })]);
                })
                .then(([courses, deleteCourse]) => {
                    const noResultsFound = courses.length === 0;
                    // Render kết quả ra giao diện admin
                    res.render('admin/stored-courses', {
                        layout: 'mainadmin',
                        courses: multipleMongooseToObject(courses),
                        deleteCourse: deleteCourse,
                        searchTerm: searchTerm,  // Để hiển thị lại giá trị tìm kiếm lên form nếu cần,
                        noResultsFound: noResultsFound

                    });
                })
                .catch(next);
        } else {
            // Nếu không có search term, thực hiện tìm kiếm như bình thường
            let courseQuery = Course.find({}).populate([{path:'category'},{path:'catelist'}]);

            if (req.query.hasOwnProperty('_sort')) {
                courseQuery = courseQuery.sort({
                    [req.query.column]: req.query.type
                });
            }

            Promise.all([courseQuery, Course.countDocumentsWithDeleted({ deleted: true })])
                .then(([courses, deleteCourse]) => {
                    res.render('admin/stored-courses', {
                        layout: 'mainadmin',
                        courses: multipleMongooseToObject(courses),
                        deleteCourse: deleteCourse
                    });
                })
                .catch(next);
        }




    }
    // [GET] admin/:id/edit
    edit(req, res, next) {
        const availableCountries = ['han-quoc', 'hong-kong', 'nhat-ban', 'thai-lan', 'trung-quoc', 'tong-hop', 'viet-nam', 'au-my', 'dai-loan'];
        Promise.all([Course.findOne({ _id: req.params.id }).populate([{path:'category'},{path:'catelist'}]),Categories.find({}),CateList.find({})])
            .then(function ([course, categorie,catelist]) {
                res.render('admin/edit', {
                    layout: 'mainadmin',
                    courses: mongooseToObject(course),
                    categories: multipleMongooseToObject(categorie),
                    catelist: multipleMongooseToObject(catelist),
                    availableCountries: availableCountries
                })
            })
            .catch(function (error) {
                next(error)
            })


    }

    // [GET] /admin/:id/edit/category
    editCategory(req, res, next) {
        Categories.findOne({ _id: req.params.id })
            .then(function (categories) {
                if (categories) {
                    res.render('categories/edit-category', {
                        layout: 'mainadmin',
                        categories: mongooseToObject(categories)
                    })
                }

            })
            .catch(function (err) {
                next(err)
            })

    }
    // [GET] /admin/:id/catelist
    editCateList(req, res, next) {
        CateList.findOne({ _id: req.params.id })
            .then(function (catelist) {
                if (catelist) {
                    res.render('admin/catelist/edit-catelist', {
                        layout: 'mainadmin',
                        catelist: mongooseToObject(catelist)
                    })
                }

            })
            .catch(function (err) {
                next(err)
            })
    }

    // [PUT] /admin/:id
    update(req, res, next) {
        req.body.image = `https://img.youtube.com/vi/${req.body.videoid}/sddefault.jpg`
        Course.updateOne({ _id: req.params.id }, req.body)
            .then(function () {
                res.redirect('/admin/stored/courses')
            })
            .catch(function (err) {
                next(err)
            }
            )
    }
    updateCategory(req, res, next) {
        const categoryNameLowerCase = req.body.name.toLowerCase();

        // Tìm thể loại khác với _id hiện tại và có tên trùng (bỏ qua chữ hoa/thường)
        Categories.findOne({
            name: new RegExp('^' + categoryNameLowerCase + '$', 'i'),
            _id: { $ne: req.params.id } // Bỏ qua thể loại hiện tại
        })
            .then(function (existingCategory) {
                if (existingCategory) {
                    // Nếu tìm thấy thể loại trùng tên, trả về thông báo lỗi
                    Categories.findOne({ _id: req.params.id })
                        .then(function (categories) {
                            res.render('categories/edit-category', {
                                layout: 'mainadmin',
                                error: 'Thể loại đã tồn tại', // Thông báo lỗi
                                categories: mongooseToObject(categories), // Giữ lại thông tin của thể loại hiện tại
                            });
                        })
                        .catch(function (err) {
                            next(err);
                        });
                } else {
                    // Nếu không tìm thấy thể loại trùng tên, tiến hành cập nhật
                    Categories.updateOne({ _id: req.params.id }, {
                        name: req.body.name,
                        description: req.body.description,
                    })
                        .then(function () {
                            res.redirect('/admin/stored/category');
                        })
                        .catch(function (err) {
                            next(err);
                        });
                }
            })
            .catch(function (err) {
                next(err);
            });
    }
    // [PUT] /admin/:id/catelist
    updateCateList(req, res, next) {
        const categoryNameLowerCase = req.body.name.toLowerCase();

        // Tìm thể loại khác với _id hiện tại và có tên trùng (bỏ qua chữ hoa/thường)
        CateList.findOne({
            name: new RegExp('^' + categoryNameLowerCase + '$', 'i'),
            _id: { $ne: req.params.id } // Bỏ qua thể loại hiện tại
        })
            .then(function (existingCategory) {
                if (existingCategory) {
                    // Nếu tìm thấy thể loại trùng tên, trả về thông báo lỗi
                    CateList.findOne({ _id: req.params.id })
                        .then(function (catelist) {
                            res.render('admin/catelist/edit-category', {
                                layout: 'mainadmin',
                                error: 'Danh mục đã tồn tại', // Thông báo lỗi
                                catelist: mongooseToObject(catelist), // Giữ lại thông tin của thể loại hiện tại
                            });
                        })
                        .catch(function (err) {
                            next(err);
                        });
                } else {
                    // Nếu không tìm thấy thể loại trùng tên, tiến hành cập nhật
                    CateList.updateOne({ _id: req.params.id }, {
                        name: req.body.name,
                        description: req.body.description,
                    })
                        .then(function () {
                            res.redirect('/admin/stored/catelist');
                        })
                        .catch(function (err) {
                            next(err);
                        });
                }
            })
            .catch(function (err) {
                next(err);
            });
    }

    // [DELETE] admin/:id
    // delete method sort delete xóa trên giao diện
    // thêm 1 field delete:true
    delete(req, res, next) {

        Course.delete({ _id: req.params.id })
            .then(function () {
                res.redirect('/admin/stored/courses')
            })
            .catch(function (err) {
                next(err)
            })
    }

    // [GET] admin/trash/courses
    trash(req, res, next) {
        // findWithDeleted là phương thức của plugin moongose-delete
        // chỉ hiển thị các document có deleted: true
        Course.findWithDeleted({ deleted: true })
            .then(function (course) {
                res.render('admin/trash-courses', {
                    layout: 'mainadmin',
                    courses: multipleMongooseToObject(course)
                })
            })
            .catch(function (err) {
                next(err)
            })
    }
    // [Patch] /admin/:id/restore
    restore(req, res, next) {
        Course.restore({ _id: req.params.id })
            .then(function () {
                // redirect chuyển hướng trang với requesr get khác với render view
                // redirect back sẽ reload lại chính route hiện tại
                res.redirect('back')
            })
            .catch(function (err) {
                next(err)
            })
    }
    // [DELETE] /admin/:id/force
    // deleteOne: method mongoose dùng để xóa vĩnh viễn
    destroy(req, res, next) {
        Course.deleteOne({ _id: req.params.id })
            .then(function () {
                res.redirect('back')
            })
            .catch(function (err) {
                next(err)
            })
    }
    // [DELETE - Soft] admin/:id/category
    deleteCategory(req, res, next) {
        const categoryId = req.params.id;

        // Đầu tiên xóa mềm thể loại
        Categories.delete({ _id: categoryId })
            .then(() => {
                // Sau khi xóa mềm thể loại, xóa mềm tất cả các khóa học có category tương ứng
                return Course.updateMany({ category: categoryId }, { $set: { deleted: true, deletedAt: new Date() } });
            })
            .then(() => {
                res.redirect('/admin/stored/category');  // Điều hướng về trang danh sách thể loại
            })
            .catch(err => {
                next(err);
            });

    }

    // [DELETE] /admin/:id/catelist
    deleteCateList(req, res, next) {
        const categoryId = req.params.id;

        // Đầu tiên xóa mềm thể loại
        CateList.delete({ _id: categoryId })
            .then(() => {
                // Sau khi xóa mềm thể loại, xóa mềm tất cả các khóa học có category tương ứng
                return Course.updateMany({ catelist: categoryId }, { $set: { deleted: true, deletedAt: new Date() } });
            })
            .then(() => {
                res.redirect('/admin/stored/catelist');  // Điều hướng về trang danh sách thể loại
            })
            .catch(err => {
                next(err);
            });

    }
    // [GET] /admin/trash/category
    trashCategory(req, res, next) {
        // findWithDeleted là phương thức của plugin moongose-delete
        // chỉ hiển thị các document có deleted: true
        Categories.findWithDeleted({ deleted: true })
            .then(function (categories) {
                res.render('categories/trash-categories', {
                    layout: 'mainadmin',
                    categories: multipleMongooseToObject(categories)
                })
            })
            .catch(function (err) {
                next(err)
            })
    }
    trashCateList(req, res, next) {
        CateList.findWithDeleted({ deleted: true })
            .then(function (catelist) {
                res.render('admin/catelist/trash-catelist', {
                    layout: 'mainadmin',
                    catelist: multipleMongooseToObject(catelist)
                })
            })
            .catch(function (err) {
                next(err)
            })
    }

    //  
    restoreCategory(req, res, next) {
        Categories.restore({ _id: req.params.id })
            .then(function () {
                // redirect chuyển hướng trang với requesr get khác với render view
                // redirect back sẽ reload lại chính route hiện tại
                res.redirect('back')
            })
            .catch(function (err) {
                next(err)
            })
    }
    // [PATCH] /admin/:id/catelist
    restoreCateList(req, res, next) {
        CateList.restore({ _id: req.params.id })
            .then(function () {
                // redirect chuyển hướng trang với requesr get khác với render view
                // redirect back sẽ reload lại chính route hiện tại
                res.redirect('back')
            })
            .catch(function (err) {
                next(err)
            })
    }
    destroyCategory(req, res, next) {
        Categories.deleteOne({ _id: req.params.id })
            .then(() => {
                // Sau khi xóa mềm thể loại, xóa mềm tất cả các khóa học có category tương ứng
                return Course.deleteOne({ category: req.params.id });
            })
            .then(() => {
                res.redirect('/admin/stored/category');  // Điều hướng về trang danh sách thể loại
            })
            .catch(err => {
                next(err);
            });
    }
    // [DELETE] /admin/:id/catelist/force 
    destroyCateList(req, res, next) {
        CateList.deleteOne({ _id: req.params.id })
            .then(function () {
                return Course.deleteOne({ catelist: req.params.id })
            })
            .then(() => {
                res.redirect('/admin/stored/catelist');  // Điều hướng về trang danh sách thể loại
            })
            .catch(err => {
                next(err);
            });
    }

    // [POST] /admin/handle-form-actions
    handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                // mongoose sử dụng $in để kiểm tra trong 1 mảng so sánh với _id
                Course.delete({ _id: { $in: req.body.courseid } })
                    .then(function () {
                        res.redirect('back')
                    })
                    .catch(function (err) {
                        next(err)
                    })

                break;
            default:
                res.json({ message: 'Action is invalid!' })
        }
    }
    handleFormActionsCategory(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                // mongoose sử dụng $in để kiểm tra trong 1 mảng so sánh với _id
                Categories.delete({ _id: { $in: req.body.categoryid } })
                    .then(function () {
                        res.redirect('back')
                    })
                    .catch(function (err) {
                        next(err)
                    })

                break;
            default:
                res.json({ message: 'Action is invalid!' })
        }
    }
    handleFormActionsCateList(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                // mongoose sử dụng $in để kiểm tra trong 1 mảng so sánh với _id
                CateList.delete({ _id: { $in: req.body.categoryid } })
                    .then(function () {
                        res.redirect('back')
                    })
                    .catch(function (err) {
                        next(err)
                    })

                break;
            default:
                res.json({ message: 'Action is invalid!' })
        }
    }

    showAccount(req, res, next) {
        let accountQuery = User.find({})
        if (req.query.hasOwnProperty('_sort')) {
            accountQuery = accountQuery.sort({
                [req.query.column]: req.query.type
            })

        }

        accountQuery
            .then(function (account) {
                res.render('admin/account/account-manager', {
                    layout: 'mainadmin',
                    accounts: multipleMongooseToObject(account)
                })
            })
            .catch(function (err) {
                next(err)
            })

    }

    showDashboard(req, res, next) {
        res.render('admin/dashboard', {
            layout: 'mainadmin'
        })

    }

}





// tạo ra 1 đối tượng NewsController để export ra ngoài
module.exports = new AdminController();