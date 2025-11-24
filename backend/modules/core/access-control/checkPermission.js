const Role = require("../../user/role.model");
const User = require("../../user/user.model");

module.exports = (permissionKey) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user.id).populate({
      path: "role",
      populate: { path: "permissions" }
    });

    const userPermissions = user.role.permissions.map(p => p.key);

    if (!userPermissions.includes(permissionKey)) {
      return res.status(403).json({ message: "Access Denied" });
    }

    next();
  };
};
