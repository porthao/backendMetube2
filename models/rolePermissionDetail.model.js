const mongoose = require("mongoose");

const RolePermissionDetailsSchema = mongoose.Schema(
  {
    role_id: { type: mongoose.Types.ObjectId, ref: "Role" },
    permission_id: { type: mongoose.Types.ObjectId, ref: "Permission" },
    created_by: { type: mongoose.Types.ObjectId, ref: "Staff" },
    updated_by: { type: mongoose.Types.ObjectId, ref: "Staff", default: null },
    deleted_by: { type: mongoose.Types.ObjectId, ref: "Staff", default: null },
  },
  { timestamps: true, versionKey: false }
);
module.exports = mongoose.model(
  "RolePermissionDetails",
  RolePermissionDetailsSchema
);
