const mongoose = require("mongoose");
const Permission = require("../modules/core/access-control/permission.model");
const Role = require("../modules/core/access-control/role.model");
const path = require("path");
const permissionSeed = require("./permission.seed");
const roleSeed = require("./role.seed");

require("dotenv").config({
  path: path.resolve("./config/config.env")
});

(async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.db_URL);

    console.log("Clearing old permissions & roles...");
    await Permission.deleteMany({});
    await Role.deleteMany({});

    console.log("Seeding permissions...");
    const permissions = await Permission.insertMany(permissionSeed);

    console.log("Seeding roles...");

    for (const role of roleSeed) {
      if (role.permissions === "ALL") {
        await Role.create({
          name: role.name,
          permissions: permissions.map((p) => p._id)
        });
      } else {
        const ids = permissions
          .filter((p) => role.permissions.includes(p.key))
          .map((p) => p._id);

        await Role.create({
          name: role.name,
          permissions: ids
        });
      }
    }

    console.log("RBAC seeding completed successfully 🚀");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
