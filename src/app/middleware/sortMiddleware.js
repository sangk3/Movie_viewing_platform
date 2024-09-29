 function sortMiddleware(req, res, next) {

    // sử dụng res.locals: biến chỉ tồn tại trên 1 request không ảnh hưởng tới request khác
    res.locals._sort = {
        enable: false,
        type: 'default'
    }
    if (req.query.hasOwnProperty('_sort')) {
        // res.locals._sort.enable = true;
        // res.locals._sort.type = req.query.type;
        // res.locals._sort.column = req.query.column;
        // Gộp 2 object có chung các key
        Object.assign(res.locals._sort, {
            enable: true,
            type: req.query.type,
            column: req.query.column
        })
    }

    next();
}
module.exports =sortMiddleware