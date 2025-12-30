module.exports = function hasPermission(permissionKey) {
  return (req, res, next) => {
    const user = req.user;

    if (!user?.role?.permissions) {
      return res.status(403).json({
        message: "No permissions assigned"
      });
    }

    const allowed = user.role.permissions.some(
      p => p.key === permissionKey
    );

    if (!allowed) {
      return res.status(403).json({
        message: "Permission denied"
      });
    }

    next();
  };
};
