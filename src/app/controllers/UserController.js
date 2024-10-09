const User = require('../models/User')
const bcrypt = require('bcrypt')
// dùng để encode
const { multipleMongooseToObject, mongooseToObject } = require('../../utill/mongoose')
const Information = require('../models/Information')
const { response } = require('express')

class userController {
    // [GET] /user
    getAllUsers(req, res) {
        User.find({})
            .then(function (users) {
                res.status(200).json(users)
            })
            .catch(function (err) {
                res.status(500).json(err)
            })
    }

    // [DELETE] /user/:id
    deleteUser(req, res) {
        User.findByIdAndDelete({ _id: req.params.id })
            .then(function () {
                res.status(200).json({ message: 'User deleted successfully' })
            })
            .catch(function (err) {
                res.status(500).json({ err: 'Xóa thất bại' })
            })
    }
    // [GET] /user/infor
    showInformation(req, res, next) {

        res.render('admin/information/information-account', {
            layout: 'mainadmin'
        })
    }
    async getInformation(req, res, next) {
        try {
            const user = await User.findOne({ _id: req.params.id });
            if (!user) {
                return res.status(404).json({ message: 'User không tồn tại' });
            }
    
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: 'Mật khẩu không đúng' });
            }
    
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.newpass, salt);
            console.log(hashed)
           
    
          const passUpdate= await User.updateOne({ _id: req.params.id }, { password: hashed });
            res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi thay đổi mật khẩu', error });
        }
    }
    // [GET] /user/information
    changeInformation(req,res,next){
        Information.findOne({email:req.params.slug})
        .then(function(infor){
            res.render('admin/information/informations',{
                layout:'mainadmin',
                infors:mongooseToObject(infor)
            })
         
        })
        .catch(function(error) {
            next(error);
        })

    }
    async Information(req,res,next){
        const infor = await Information.findOne({email:req.params.slug})
        try{
            res.status(200).json({infor})
        }catch(err){
            res.status(500).json({message:'lỗi'})
        }
    }
    updateInformation(req,res,next){
        Information.updateOne({email:req.params.slug},req.body)
       .then(function(){
        res.status(200).json({message:'Cập nhật thành công'})
       })
       .catch(function(error){
            res.status(500).json({message:'lỗi khi cập nhật'})
       })
    }
    
}
module.exports = new userController()