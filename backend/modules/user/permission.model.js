const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  module: { type: String, required: true },
  key: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  description: String,
});

module.exports = mongoose.model("Permission", permissionSchema);
