module.exports = function authorizePermission(permissionKey) {
    return (req, res, next) => {
        const permissions = req.user?.role?.permissions || [];

        const has = permissions.some(p => p.key === permissionKey);

        if (!has) {
            return res.status(403).json({ message: "Permission denied" });
        }

        next();
    };
};
