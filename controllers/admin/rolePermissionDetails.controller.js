const rolePermission = require("../../models/rolePermissionDetail.model.js");
const {
  validateKeyInput,
  getRequiredFields,
  extractDataBySchema,
  convertStringToNumber,
  generateRandomStringWithTime,
  isValidEnumData,
  getUniqueDataRolePermissionDetails,
} = require("../../util/validate.js");

const { STATUS_TYPE } = require("../../types/constant.js");
const staffModel = require("../../models/staff.model.js");
const roleModel = require("../../models/role.model.js");
const permissionModel = require("../../models/permission.model.js");
const rolePermissionDetailModel = require("../../models/rolePermissionDetail.model.js");

exports.create = async (req, res) => {
  try {
    const staffId = req.admin._id;

    const data = getUniqueDataRolePermissionDetails(req.body.data);

    if (!data)
      return res.status(200).json({
        status: false,
        message:
          "data must be required!  data =[{role_id:1,permission_id:1},{role_id:1,permission_id:12}]",
      });

    if (!staffId) {
      return res
        .status(200)
        .json({ status: false, message: "staffId must be required!" });
    }

    const staff = await staffModel.findOne({ _id: staffId });
    if (!staff) {
      return res.status(200).json({
        status: false,
        message: `Staff not found`,
      });
    }

    let rolePermissionList = [];
    let rolePermissionErrorList = [];

    for (const element of data) {
      const [roleExists, permissionExists, rolePermissionDetailsExists] =
        await Promise.all([
          roleModel.findById(element.role_id),
          permissionModel.findById(element.permission_id),
          rolePermissionDetailModel.findOne({
            role_id: element.role_id,
            permission_id: element.permission_id,
          }),
        ]);

      if (roleExists && permissionExists && !rolePermissionDetailsExists) {
        rolePermissionList.push({ ...element, created_by: staffId });
      }

      if (!roleExists || !permissionExists || rolePermissionDetailsExists) {
        rolePermissionErrorList.push({
          ...element,
          message: `${
            !roleExists
              ? "role_id"
              : !permissionExists
              ? "permission_id"
              : "already exists"
          }`,
        });
      }
    }

    const rolePermissionDetails = await rolePermissionDetailModel.insertMany(
      rolePermissionList
    );

    return res.status(200).json({
      status: true,
      message: "RolePermission creation success",
      data: rolePermissionDetails,
      error_data: rolePermissionErrorList,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    let { rolePermissionDetailsId } = req.query;
    if (!rolePermissionDetailsId) {
      return res.status(200).json({
        status: false,
        message: "rolePermissionDetailsId must be required! ",
      });
    }
    rolePermissionDetailsId = rolePermissionDetailsId.split(",");

    const deletedData = await rolePermissionDetailModel.find({
      _id: { $in: rolePermissionDetailsId },
    });

    // Delete the documents
    const result = await rolePermissionDetailModel.deleteMany({
      _id: { $in: rolePermissionDetailsId },
    });
    return res.status(200).json({
      status: true,
      message: "RolePermission delete success",
      data: deletedData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const staffId = req.admin._id;
    let { rolePermissionDetailsId } = req.query;
    const { role_id, permission_id } = req.body;
    if (!role_id || !permission_id) {
      return res.status(200).json({
        status: false,
        message: "role_id and permission_id must be required!",
      });
    }

    if (!rolePermissionDetailsId) {
      return res.status(200).json({
        status: false,
        message: "rolePermissionDetailsId must be required!",
      });
    }

    if (!staffId) {
      return res
        .status(200)
        .json({ status: false, message: "staffId must be required!" });
    }
    const staff = await staffModel.findOne({
      _id: staffId,
      status: { $ne: STATUS_TYPE.Deleted },
    });
    if (!staff) {
      return res.status(200).json({
        status: false,
        message: `Staff not found`,
      });
    }
    const [roleExists, permissionExists, rolePermissionDetailsExists] =
      await Promise.all([
        roleModel.findById(req.body.role_id),
        permissionModel.findById(req.body.permission_id),
        rolePermissionDetailModel.findOne({
          role_id: req.body.role_id,
          permission_id: req.body.permission_id,
        }),
      ]);
    if (
      !roleExists ||
      !permissionExists ||
      (rolePermissionDetailsExists &&
        rolePermissionDetailsId !== rolePermissionDetailsExists._id.toString())
    ) {
      return res.status(200).json({
        status: false,
        message: `${
          !roleExists
            ? "role_id"
            : !permissionExists
            ? "permission_id"
            : "already exists"
        }`,
      });
    }

    const result = await rolePermissionDetailModel.findByIdAndUpdate(
      { _id: rolePermissionDetailsId },
      { role_id, permission_id, updated_by: staffId }
    );

    return res.status(200).json({
      status: true,
      message: "RolePermission update success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
