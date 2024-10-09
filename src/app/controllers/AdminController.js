const Course = require('../models/Course')
const Categories = require('../models/Categories')
const User = require('../models/User')
const CateList = require('../models/CateList')
const Infor = require('../models/Information')
const { multipleMongooseToObject, mongooseToObject } = require('../../utill/mongoose')
const { response } = require('express')
const { trusted } = require('mongoose')

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
        Promise.all([Categories.find({}), CateList.find({})])
            .then(function ([category, catelist]) {

                res.render('courses/create', {
                    layout: 'mainadmin',
                    categories: multipleMongooseToObject(category),
                    catelist: multipleMongooseToObject(catelist)

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
        const page = parseInt(req.query.page) || 1;  // Lấy trang hiện tại từ query hoặc mặc định là trang 1
        const pageSize = parseInt(req.query.pageSize) || 3;  // Số lượng khóa học trên mỗi trang, mặc định là 2
        const skipPage = (page - 1) * pageSize;  // Tính toán số tài liệu cần bỏ qua
        const searchTerm = req.query.search || '';  // Lấy từ khóa tìm kiếm từ query hoặc rỗng nếu không có
        const query = {};  // Tạo query tìm kiếm

        // Nếu có searchTerm, tìm kiếm theo tên, quốc gia và thể loại phim
        if (searchTerm) {
            Categories.find({ name: new RegExp(searchTerm, 'i') })
                .then((foundCategories) => {
                    const categoryIds = foundCategories.map(category => category._id);
                    query.$or = [
                        { name: new RegExp(searchTerm, 'i') },  // Tìm kiếm theo tên phim
                        { countries: new RegExp(searchTerm, 'i') },  // Tìm kiếm theo quốc gia
                        { category: { $in: categoryIds } }  // Tìm kiếm theo thể loại
                    ];

                    // Tiếp tục với việc tìm kiếm khóa học
                    return runCourseQuery(query);
                })
                .catch(next);
        } else {
            // Nếu không có từ khóa tìm kiếm, chỉ phân trang và sắp xếp
            runCourseQuery(query);
        }

        function runCourseQuery(query) {
            let courseQuery = Course.find(query)
                .skip(skipPage)
                .limit(pageSize)
                .populate([{ path: 'category' }, { path: 'catelist' }]);

            // Nếu có yêu cầu sắp xếp, thêm phần sort vào query
            if (req.query.hasOwnProperty('_sort')) {
                courseQuery = courseQuery.sort({
                    [req.query.column]: req.query.type
                });
            }

            // Thực hiện query tìm khóa học và đếm số khóa học bị xóa đồng thời
            Promise.all([courseQuery, Course.countDocuments(query), Course.countDocumentsWithDeleted({ deleted: true })])
                .then(([courses, totalCourses, deleteCourse]) => {
                    const totalPages = Math.ceil(totalCourses / pageSize);  // Tính tổng số trang
                    const noResultsFound = courses.length === 0;  // Kiểm tra xem có kết quả tìm kiếm hay không

                    // Render kết quả ra giao diện admin
                    res.render('admin/stored-courses', {
                        layout: 'mainadmin',
                        courses: multipleMongooseToObject(courses),
                        deleteCourse: deleteCourse,
                        searchTerm: searchTerm,
                        noResultsFound: noResultsFound,
                        currentPage: page,
                        totalPages: totalPages
                    });
                })
                .catch(next);
        }
    }

    // [GET] admin/:id/edit
    edit(req, res, next) {
        const availableCountries = ['han-quoc', 'hong-kong', 'nhat-ban', 'thai-lan', 'trung-quoc', 'tong-hop', 'viet-nam', 'au-my', 'dai-loan'];
        Promise.all([Course.findOne({ _id: req.params.id }).populate([{ path: 'category' }, { path: 'catelist' }]), Categories.find({}), CateList.find({})])
            .then(function ([course, categorie, catelist]) {
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
    // [DELETE] /:id/account
    destroyAccount(req, res, next) {
        User.delete({ _id: req.params.id })
            .then(function () {
                res.status(200).json({ message: 'Delete success' })
            })
            .catch(function () {
                res.status(500).json({ message: 'Delete fail' })
            })
    }

    // [PATCH] /admin/:id/account/restore
    restoreAccount(req, res, next) {
        User.restore({ _id: req.params.id })
            .then(function () {
                res.redirect('/admin/account')
            })
            .catch(function (err) {
                next(err)
            })
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
    // [GET] /admin/accouht
    showAccount(req, res, next) {

        Promise.all([User.find({}), User.countDocumentsWithDeleted({ deleted: true })])
            .then(function ([account, deleteAccount]) {
                res.render('admin/account/account-manager', {
                    layout: 'mainadmin',
                    accounts: multipleMongooseToObject(account),
                    deleteAccount
                })
            })
            .catch(function (err) {
                next(err)
            })

    }

    // [GET] /admin/account/âccount
    trashAccount(req, res, next) {
        // findWithDeleted là phương thức của plugin moongoose-delete
        // chỉ hiển thị các document có deleted: true
        User.findWithDeleted({ deleted: true })
            .then(function (accounts) {
                res.render('admin/account/trash', {
                    layout: 'mainadmin',
                    accounts: multipleMongooseToObject(accounts)
                })
            })
            .catch(function (err) {
                next(err)
            })
    }
    // [GET] /admin/account/edit
    editAccount(req, res, next) {
        User.findOne({ _id: req.params.id })
            .then(function (accounts) {
                res.render('admin/account/edit', {
                    layout: 'mainadmin',
                    accounts: mongooseToObject(accounts)
                })
            })
            .catch(function (err) {
                next(err)
            })
    }

    // [PUT] /admin/:id/account
    updateAccount(req, res, next) {
        User.updateOne({ _id: req.params.id }, req.body)
            .then(function () {
                res.redirect('/admin/account')
            })
            .catch(function (err) {
                next(err)
            })
    }

    handleFormActionAccount(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                // mongoose sử dụng $in để kiểm tra trong 1 mảng so sánh với _id
                User.delete({ _id: { $in: req.body.accountid } })
                    .then(function () {
                        res.redirect('back')
                    })
                    .catch(function (err) {
                        next(err)
                    })

                break;
            default:
                res.json({ message: 'Lỗi khi xóa!' })
        }
    }
//[DELETE] /admin/:id/account/force
    forceAccount(req,res,next){
        User.deleteOne({ _id: req.params.id })
            .then(function () {
                res.redirect('/admin/account')
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
    // [GET] /admin/create/info
    createInfomation(req, res, next) {
        res.render('admin/infor/create', {
            layout: 'mainadmin'
        })
    }
    async storeInfo(req, res, next) {
        try {
            const exitInfo = await Infor.findOne({ email: req.body.email })
            const exitPhone = await Infor.findOne({ phone: req.body.phone })
            if (exitInfo) {
                return res.status(403).json({ message: 'Email đã tồn tại' })
            }
            else if (exitPhone) {
                return res.status(403).json({ message: 'Số điện thoại đã tồn tại' })
            }
            const infoUser = await new Infor({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
            })
            const info = await infoUser.save()
            res.status(200).json({ message: 'sucess' })
        }
        catch (err) {
            res.status(500).json({ message: 'error' })
        }
    }
    // [GET] /admin/stored/info
    showInformation(req, res, next) {
        Promise.all([Infor.find({}), Infor.countDocumentsWithDeleted({ deleted: true })])
            .then(function ([info, countDeleted]) {
                res.render('admin/infor/stored-info', {
                    layout: 'mainadmin',
                    infors: multipleMongooseToObject(info),
                    countDeleted
                })
            })
            .catch((err) => {
                next(err)
            })



    }
    editInfor(req, res, next) {
        Infor.findOne({ _id: req.params.id })
            .then(function (info) {
                res.render('admin/infor/edit', {
                    layout: 'mainadmin',
                    info: mongooseToObject(info),
                })
            })
            .catch((err) => {
                next(err)
            })
    }
    updateInfo(req, res, next) {
        Infor.updateOne({ _id: req.params.id }, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address
        })
            .then(function () {
                res.status(200).json({ message: 'Cập nhật thành công' })
            })
            .catch(function () {
                res.status(500).json({ message: 'Cập nhật thất bại' })
            })


    }
    // [PATCH] /admin/:slug/info
    deleteInfo(req, res, next) {
        Infor.delete({ email: req.params.slug })
            .then(function () {
                User.delete({ email: req.params.slug })
                    .then(function (result) {
                        res.status(200).json({ message: 'Xóa thành công' })
                    })
                    .catch(function (err) {
                        res.status(500).json({ message: 'lỗi khi xóa user' })
                    })

            })
            .catch(function (err) {
                res.status(500).json({ message: 'lỗi khi xóa' })
            })

    }
    // [GET] /admin/trash/info
    trashInfo(req, res, next) {
        Infor.findWithDeleted({ deleted: true })
            .then(function (infor) {
                res.render('admin/infor/trash', {
                    layout: 'mainadmin',
                    infor: multipleMongooseToObject(infor)
                })
            })
            .catch(function (err) {
                next(err)
            })
    }

    // [PATCH] /admin/info/restore
    async restoreInfo(req, res, next) {
        try {
            const info = await Infor.restore({ email: req.params.slug })
            const account = await User.restore({ email: req.params.slug })
            res.redirect('/admin/stored/info')
        } catch (err) {
            res.status(500).json({ message: 'lỗi khi khôi phục' })
        }
    }
    handleFormActionsInfo(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                // mongoose sử dụng $in để kiểm tra trong 1 mảng so sánh với _id
                Infor.delete({ _id: { $in: req.body.inforid } })
                    .then(function () {
                        res.redirect('back')
                    })
                    .catch(function (err) {
                        next(err)
                    })

                break;
            default:
                res.json({ message: 'Lỗi khi xóa!' })
        }
    }
    // [DELETE] /admin/:slug/info/force
    async destroyInfo(req, res, next) {
        try {
            const deleteInfo = await Infor.deleteOne({ email: req.params.slug })
            const deleteAccountt = await User.deleteOne({ email: req.params.slug })
            res.status(200).json({ message: 'xóa thành công' })
        } catch (err) {
            res.status(500).json({ message: 'lỗi khi xóa' })
        }
    }
}






// tạo ra 1 đối tượng NewsController để export ra ngoài
module.exports = new AdminController();