const bcrypt = require('bcrypt')
const Viewer = require('../models/Viewer')
const { multipleMongooseToObject, mongooseToObject } = require('../../utill/mongoose')
const { response } = require('express')
const { trusted } = require('mongoose')

class ViewerController {
    // [GET] /viewer/login
    showLogin(req,res,next){
        res.render('user/login/login',{
            layout:'login'
        })
    }
    showRegister(req,res,next){
        res.render('user/register/register',{
            layout:'login'
        })
    }
    async createViewer(req, res, next) {
        try {
            const existingUser = await Viewer.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(403).json({ message: "Email already exits" });
            }
            console.log(req.body)
            // bcrypt.genSalt: tạo 1 chuỗi 10 kí tự ngẫu nhiên
            const salt = await bcrypt.genSalt(10);
            // endcode pass --> chuỗi 10 kí tự đó
            const hashed = await bcrypt.hash(req.body.password, salt)
            const newViewer = await new Viewer({
                username: req.body.username,
                email: req.body.email,
                password: hashed
            })
                console.log(newViewer)
            // dùng để lưu vào database
            const viewer = await newViewer.save()
            res.status(200).json({viewer,message: 'success'})
           
        }

        catch (err) {
            res.status(500).json({message:"Error create account!"})
        };

    }

}

module.exports =new ViewerController();