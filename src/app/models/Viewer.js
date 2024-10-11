const mongoose = require('mongoose')
var mongoose_delete = require('mongoose-delete');

const Viewer = new mongoose.Schema({
    username: { type: String, required: true, minlength: 6, maxlength: 20, unique: true },
    email: { type: String, required: true, minlength: 6, maxlength: 50, unique: true },
    password: { type: String, required: true, minlength: 6 },

}, { timestamps: true })
Viewer.plugin(mongoose_delete, {
    deletedAt: true,
    overrideMethods: 'all'
}
);
module.exports = mongoose.model('Viewer', Viewer)