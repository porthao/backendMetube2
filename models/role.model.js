const mongoose = require("mongoose");
const { STATUS_TYPE } = require("../types/constant");
const RoleSchema = mongoose.Schema(
  {
    role_name: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(STATUS_TYPE),
      default: STATUS_TYPE.IsActive,
    },
    created_by: { type: mongoose.Types.ObjectId, ref: "Staff" },
    updated_by: { type: mongoose.Types.ObjectId, ref: "Staff", default: null },
    deleted_by: { type: mongoose.Types.ObjectId, ref: "Staff", default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Role", RoleSchema);
