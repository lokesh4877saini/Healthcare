const express = require('express');
const router = express.Router();
const { registerUser, loginUser,getUserDetails, logout,deleteAllUser
}
    = require('../controllers/userController');
    router.route('/login').post(loginUser);
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/Auth');
router.route('/register').post(registerUser);
router.route("/logout").post(logout);
router.route('/me').get(isAuthenticatedUser,authorizeRoles('patient','doctor'),getUserDetails);
router.route('/delete/All').delete(deleteAllUser);
module.exports = router;