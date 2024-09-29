const jwt = require('jsonwebtoken');

const authMiddleware = {
  // xác thực token 
  verifyToken: function (req, res, next) {
    const token = req.headers['authorization'];
    if (token) {
      // lấy ra token: Bearer token
      const accessToken = token.split(" ")[1]
      jwt.verify(accessToken, 'secretKey', (err, user) => {
        if (err) {
          // 403:forbidden
          res.status(403).json('Token không đúng')
        }
        // trả về user
        req.user = user;
        next();
      })
    }
    else {
      res.status(401).json('Token chưa tồn tại')
    }
  },

  verifyTokenAdminAuth: function (req, res, next) {
    // Check admin
    authMiddleware.verifyToken(req, res, () => {
      if (req.user.id == req.params.id || req.user.admin) {
        next();
      }
      else {
        res.status(403).json('Bạn không có quyền xóa')
      }
    })
  }
}

module.exports = authMiddleware;