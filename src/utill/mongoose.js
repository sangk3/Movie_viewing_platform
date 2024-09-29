
   const multipleMongooseToObject= function(mongooses){
        return mongooses.map(function(mongoose){
            return mongoose.toObject()  // Return mongoose object as a JavaScript object
        })
    }

    // mongoose sẽ trả về một mảng các object constructor cần đưa về object để xử lý
   const mongooseToObject = function(mongoose){
        return mongoose ? mongoose.toObject():mongoose
    }

module.exports = {multipleMongooseToObject,mongooseToObject}
