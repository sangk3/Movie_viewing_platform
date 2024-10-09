//  tách route sử dụng route.use() cấu hình route

const express = require('express');
// sử dụng phương thức Router của express để định nghĩa tuyến đường
const router = express.Router();
const adminController = require("../app/controllers/AdminController")
const authMiddleware = require("../app/middleware/authMiddleware")
const sortMiddleware = require("../app/middleware/sortMiddleware")

// account management
router.get('/account',adminController.showAccount)
router.get('/trash/account',adminController.trashAccount)
router.get('/:id/account/edit',adminController.editAccount)
router.put('/:id/account',adminController.updateAccount)
router.delete('/account/:id',adminController.destroyAccount)
router.patch('/:id/account/restore',adminController.restoreAccount)
router.post('/handle-form-actions/account',adminController.handleFormActionAccount)
router.delete('/:id/account/force',adminController.forceAccount)
// information account

router.get('/create/info',adminController.createInfomation)
router.post('/store/info',adminController.storeInfo)
router.get('/stored/info',adminController.showInformation)
router.get('/:id/edit/info',adminController.editInfor)
router.put('/:id/info',adminController.updateInfo)
router.delete('/:slug/info',adminController.deleteInfo)
router.get('/trash/info',adminController.trashInfo)
router.patch('/:slug/info/restore',adminController.restoreInfo)
router.post('/handle-form-actions/info',adminController.handleFormActionsInfo)
router.delete('/:slug/info/force',adminController.destroyInfo)

router.get('/dashboard',adminController.showDashboard)

// newsController.index 
router.get('/create',adminController.create);
router.get('/create/category',adminController.createCategory);
router.post('/store',adminController.store);
router.post('/store/category',adminController.storeCategory);
router.get('/create/catelist',adminController.createCateList);
router.post('/store/catelist',adminController.storeCateList);
router.get('/stored/catelist',adminController.storedCateList)
router.post('/handle-form-actions/catelist',adminController.handleFormActionsCateList)
router.get('/stored/category',adminController.storedCategory)
router.get('/stored/courses',adminController.storedCourses)
router.post('/handle-form-actions/category',adminController.handleFormActionsCategory)
router.post('/handle-form-actions',adminController.handleFormActions)
router.get('/:id/edit',adminController.edit)
router.get('/:id/edit/category',adminController.editCategory)
router.get('/:id/edit/catelist',adminController.editCateList)

//sort-delete
router.delete('/:id/catelist',adminController.deleteCateList)
router.delete('/:id/category',adminController.deleteCategory)
router.delete('/:id',adminController.delete)

// delete force
router.delete('/:id/force',adminController.destroy)
router.delete('/:id/category/force',adminController.destroyCategory)
router.delete('/:id/catelist/force',adminController.destroyCateList)


router.get('/trash/courses',adminController.trash)
router.get('/trash/category',adminController.trashCategory)
router.get('/trash/catelist',adminController.trashCateList)

router.put('/:id',adminController.update)
router.put('/:id/category',adminController.updateCategory)
router.put('/:id/catelist',adminController.updateCateList)
// patch sẽ là 1 hành động khác các hành động mặc định là hành động restore
router.patch('/:id/restore',adminController.restore)
router.patch('/:id/category/restore',adminController.restoreCategory)

router.get('/data',authMiddleware.verifyToken,adminController.check)
router.get('/',adminController.show)
// cấp route con của /news cấu hình param của /news với phương thức get

module.exports = router;