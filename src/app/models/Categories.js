// phải định nghĩa đầy đủ những field muốn insert 
// mongoose mới insert được và các ràng buộc ở model
// timestamp sẽ tự dộng tạo createAt và endAt
//mongoose-slug-adaper không cho trùng slug


const mongoose = require('mongoose')
var mongoose_delete = require('mongoose-delete');
var Course = require('./Course')

const Schema = mongoose.Schema;

const Categories = new Schema({
    name: { type: String, required: true },
    description: { type: String },
}, { timestamps: true });



// khi xóa sẽ thêm 1 field deleteAt vào db
// overide all methods với method delete soft
Categories.plugin(mongoose_delete, {
    deletedAt: true,
    overrideMethods: 'all'
}
);
module.exports = mongoose.model('Categories', Categories)