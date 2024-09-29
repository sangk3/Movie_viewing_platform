// phải định nghĩa đầy đủ những field muốn insert 
// mongoose mới insert được và các ràng buộc ở model
// timestamp sẽ tự dộng tạo createAt và endAt
//mongoose-slug-adaper không cho trùng slug

const mongoose  = require('mongoose')
// thay thế mongoose-slug-generator
const slug = require('mongoose-slug-updater')
var mongoose_delete = require('mongoose-delete');
var Categories=require('./Categories')
var CateList = require('./CateList')

const Schema =  mongoose.Schema;

const Course = new Schema({
    name:{type: String,required: true},
    price:{type: Number,maxLength:12},
    description:{type: String,maxLength:200},
    videoid:{type: String,required: true},
    image:{type: String,maxLength:255},
    category:{type:Schema.Types.ObjectId,ref:'Categories'},
    catelist:{type:Schema.Types.ObjectId,ref:'Catelist'},
    countries:{type:String},
    // tự động generate slug
    slug:{type: String,slug:'name',unique:true}
   
   
},{timestamps:true});

// Add plugin
mongoose.plugin(slug);
// khi xóa sẽ thêm 1 field deleteAt vào db
// overide all methods với method delete soft
Course.plugin(mongoose_delete, { 
    deletedAt : true,
    overrideMethods: 'all' }
);
module.exports = mongoose.model('Course', Course)