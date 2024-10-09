const mongoose = require('mongoose')
var mongoose_delete = require('mongoose-delete');
var Information = require('./Information')
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, minlength: 6, maxlength: 20, unique: true },
    email: { type: String, required: true, minlength: 6, maxlength: 50, unique: true },
    password: { type: String, required: true, minlength: 6 },
    admin: { type: Boolean, default: false },
    // infor:{type:Schema.Types.ObjectId,ref:'Information'},

}, { timestamps: true })
userSchema.plugin(mongoose_delete, {
    deletedAt: true,
    overrideMethods: 'all'
}
);
module.exports = mongoose.model('User', userSchema)