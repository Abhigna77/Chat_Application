const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');

const {userLogout,userRegister,userLogin} = require('../controller/authController');

router.post('/user-login',userLogin);
router.post('/user-register',userRegister);
router.post('/user-logout',authMiddleware,userLogout);
module.exports = router;