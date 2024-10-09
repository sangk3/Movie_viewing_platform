const User = require('../models/User')
const jwt = require('jsonwebtoken')
// dùng để encode
const bcrypt = require('bcrypt')
const { multipleMongooseToObject, mongooseToObject } = require('../../utill/mongoose')

let refreshTokens = []
class authController {
    // [GET] /auth/register
    showRegister(req, res, next) {
        res.render('admin/register/register', {
            layout: 'mainadmin',
            email:req.query.email
        })
    }
    // [GET] /auth/login
    showLogin(req, res, next) {
        res.render('admin/login/login', {
            layout: 'login'
        })
    }

    // [POST]   /auth/create
    async createUser(req, res, next) {
        try {
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(403).json({ message: "Email already exits" });
            }
            console.log(req.body)
            // bcrypt.genSalt: tạo 1 chuỗi 10 kí tự ngẫu nhiên
            const salt = await bcrypt.genSalt(10);
            // endcode pass --> chuỗi 10 kí tự đó
            const hashed = await bcrypt.hash(req.body.password, salt)
            const newUser = await new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed
            })
                console.log(newUser)
            // dùng để lưu vào database
            const user = await newUser.save()
            // res.render('admin/login/login',{
            //     layout: 'login',
            // })
            res.status(200).json({user,message: 'success'})
           
        }

        catch (err) {
            res.status(500).json({message:"Error create account!"})
        };

    }


    // [POST] /auth/checklogin
    async loginUser(req, res) {
        try {
            const user = await User.findOne({ username: req.body.username })
            if (!user) {
                return res.status(404).json({mesage:"wrong username"})
            }
            //  dùng bcrypt compare để so sánh chuỗi được bcrypt với password khi người dùng nhập
            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
            )
            if (validPassword === false) {
                return res.status(441).json({message:"wrong password"})
            }
            if (user && validPassword) {
                // tạo accesskey và xét thời gian accesskey
                const accessToken = jwt.sign({
                    id: user.id,
                    admin: user.admin,
                    username: user.username,
                    email: user.email
                }, 'secretKey', { expiresIn: "30d" })
                const refreshToken = jwt.sign({
                    id: user.id,
                    admin: user.admin,
                    username: user.username,
                    email: user.email
                }, 'refreshKey', { expiresIn: "365d" })
                refreshTokens.push(refreshToken)
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    // ngăn chặn tấn công CSRF
                    sameSite: "strict",
                    secure: false,
                })
                // destructuring thông tin trả về không chứa password đảm bảo an toàn
                const { password, ...others } = user._doc
                res.status(200).json({message:"Succes Login",user:{ ...others, accessToken }})
            }
        }
        catch (err) {
            res.status(500).json({message: 'Error to Login'})
        }
    }

    // Store token(refresh token)
    // 1. Local Storage: Lưu token 
    // XSS
    // 2. HTTPONLY Cookie(cookie an toàn để lưu cookie)
    // CSRF -->SAMSITE (cơ chế bảo vệ)

    // [POST] :/auth/refersh: tạo access token mới từ refresh token
    async requestRefreshToken(req, res) {
        // Lấy refresh token từ user --> tạo access token mới
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            // nếu không có refresh token
            return res.status(401).json("No token provided")
        }
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json("Refresh token is not invalid")
        }
        jwt.verify(refreshToken, 'secretKey', function (err, user) {
            if (err) {
                console.log('err')
            }
            refreshTokens = refreshTokens.filter(function (token) {
                return token !== refreshToken
            })
            // tạo access token mới khi hết hạn
            const newAccessToken = jwt.sign({
                id: user.id,
                admin: user.admin
            }, 'secretKey', { expiresIn: "30d" })
            // tạo refresh token từ access token mới đó
            const newRefreshToken = jwt.sign({
                id: user.id,
                admin: user.admin
            }, 'refreshKey', { expiresIn: "365d" })
            //    push refresh token mới thay cho refresh token tạo access token 
            refreshTokens.push(newRefreshToken)
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                path: "/",
                // ngăn chặn tấn công CSRF
                sameSite: "strict",
                secure: false,
            })
            res.status(200).json({ accessToken: newAccessToken })

        })

    }
 


}
module.exports = new authController();