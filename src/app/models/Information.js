const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

const Information = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    address: { type: String, required: true },
    avatar: { type: String, default: 'default.jpg' }
}, { timestamps: true })

Information.plugin(mongoose_delete, {
    deletedAt: true,
    overrideMethods: 'all'
}
);

module.exports = mongoose.model('Information', Information);