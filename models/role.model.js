const mongoose = require("mongoose");
const { STATUS_TYPE } = require("../types/constant");
const RoleSchema = mongoose.Schema(
  {
    role_name: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(STATUS_TYPE),
      default: STATUS_TYPE.Active,
    },
    created_by: { type: mongoose.Types.ObjectId, ref: "Staff" },
    updated_by: { type: mongoose.Types.ObjectId, ref: "Staff", default: null },
    deleted_by: { type: mongoose.Types.ObjectId, ref: "Staff", default: null },
  },
  { timestamps: true, versionKey: false }
);

RoleSchema.index({ role_name: 1 });
RoleSchema.index({ status: 1 });

module.exports = mongoose.model("Role", RoleSchema);
