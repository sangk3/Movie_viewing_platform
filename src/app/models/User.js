const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, minlength: 6, maxlength: 20, unique: true },
    email: { type: String, required: true, minlength: 6, maxlength: 50, unique: true },
    password: { type: String, required: true, minlength: 6},
    admin: { type: Boolean, default: false },
    address:{type: String, required: true, minlength:6,maxlength: 50,unique:true},
    phone:{type:Number, required: true, minlength:10,maxlength:12,unique:true}

}, { timestamps: true })
module.exports = mongoose.model('User', userSchema)