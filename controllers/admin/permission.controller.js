const { extractDataBySchema } = require("../../util/validate");
const Permission = require("../../models/permission.model");
const { STATUS_TYPE } = require("../../types/constant");
exports.create = async (req, res) => {
  try {
    const data = extractDataBySchema(Permission, req.body);
    const permissionExists = await Permission.findOne({
      permission_name: data.permission_name,
      group_name: data.group_name,
    });

    if (permissionExists)
      return res.status(200).json({
        status: false,
        message: "permission is already exists",
      });
    const permission = await Permission.create({
      ...data,
      created_by: req.admin._id,
    });

    res.status(200).json({
      status: true,
      message: "Create Permission successful",
      data: permission,
    });
  } catch (error) {
    console.log("error :>> ", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getPermission = async (req, res) => {
  try {
    const permission = await Permission.aggregate([
      { $match: { status: { $ne: STATUS_TYPE.Deleted } } },
      { $sort: { group_name: 1, createdAt: -1 } },
    ]);
    res.status(200).json({
      status: true,
      message: "get Permission successful",
      data: permission,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
