const Permission = require("./permission.model");
const Role = require("./role.model");

class AccessService {
  static async createPermission(data) {
    return Permission.create(data);
  }

  static async createRole(data) {
    return Role.create(data);
  }

  static async assignPermissionsToRole(roleId, permissionIds) {
    return Role.findByIdAndUpdate(
      roleId,
      { permissions: permissionIds },
      { new: true }
    );
  }
}

module.exports = AccessService;
