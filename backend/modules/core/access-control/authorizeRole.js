module.exports = function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role?.name;

    if (!userRole) {
      return res.status(403).json({ message: "User has no role assigned" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Role '${userRole}' is not allowed`
      });
    }

    next();
  };
};
