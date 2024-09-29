const User = require('../models/User')
// dùng để encode
const { multipleMongooseToObject, mongooseToObject } = require('../../utill/mongoose')

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
                res.status(500).json({err:'Xóa thất bại'})
            })
    }
}
module.exports = new userController()