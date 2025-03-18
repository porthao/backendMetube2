const { STATUS_TYPE, GENDER_TYPE } = require("../types/constant");

const mongoose = require("mongoose");

const StaffSchema = mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    gender: { type: String, enum: Object.values(GENDER_TYPE), required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    dob: { type: String, required: true },
    new_name: {
      type: String,
      required: false,
    },
    position: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    profile: { type: String, required: false },
    status: {
      type: String,
      enum: Object.values(STATUS_TYPE),
      default: STATUS_TYPE.IsActive,
    },
    _2fa_secret: {
      type: String,
      enum: Object.values(GENDER_TYPE),
      required: false,
    },
    _2fa_qr_code: { type: String, required: false, default: null },
    _2fa_enable: { type: Number, required: false, default: null },
    _2fa_verify: { type: Number, required: false, default: null },
    created_by: {
      type: mongoose.Types.ObjectId,
      ref: "Staff",
      default: null,
      require: true,
    },
    updated_by: { type: mongoose.Types.ObjectId, ref: "Staff", default: null },
    delete_by: { type: mongoose.Types.ObjectId, ref: "Staff", default: null },
    role_id: { type: mongoose.Types.ObjectId, ref: "Role" },
  },
  { timestamps: true, versionKey: false }
);

StaffSchema.index({ createdAt: -1 });
StaffSchema.index({ role_id: 1 });
StaffSchema.index({ email: 1 });
StaffSchema.index({ username: 1 });
module.exports = mongoose.model("Staff", StaffSchema);
