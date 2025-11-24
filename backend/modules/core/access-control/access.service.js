const Permission = require("./permission.model");
const Role = require("./role.model");

class AccessService {
  static async createPermission(data) {
    return await Permission.create(data);
  }

  static async createRole(data) {
    return await Role.create(data);
  }

  static async assignPermissionsToRole(roleId, permissionIds) {
    return await Role.findByIdAndUpdate(roleId, { permissions: permissionIds });
  }
}

module.exports = AccessService;
