const mongoose = require("mongoose");
const { STATUS_TYPE } = require("../types/constant");

const PermissionSchema = new mongoose.Schema(
  {
    permission_name: { type: String, required: true },
    group_name: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(STATUS_TYPE),
      default: STATUS_TYPE.IsActive,
    },
    created_by: {
      type: mongoose.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
    updated_by: { type: mongoose.Types.ObjectId, ref: "Staff", default: null },
    deleted_by: { type: mongoose.Types.ObjectId, ref: "Staff", default: null },
  },
  { timestamps: true, versionKey: false } // Fixed typo
);

PermissionSchema.index({ permission_name: 1, group_name: 1 });
module.exports = mongoose.model("Permission", PermissionSchema);
