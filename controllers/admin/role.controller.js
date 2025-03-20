const Role = require("../../models/role.model");
const Staff = require("../../models/staff.model");
const { STATUS_TYPE } = require("../../types/constant");
const {
  getRequiredFields,
  validateKeyInput,
  isValidEnumData,
  extractDataBySchema,
} = require("../../util/validate");

exports.create = async (req, res) => {
  try {
    const staffId = req.admin._id;
    const requiredFields = getRequiredFields(Role);
    const validateInput = validateKeyInput(requiredFields, req.body);
    if (validateInput.length > 0)
      return res.status(200).json({
        status: false,
        message: `Required data fields missing: ${validateInput.join(", ")}`,
      });
    // Validate enum values for status
    if (req.body.status && !isValidEnumData(STATUS_TYPE, req.body.status)) {
      return res.status(200).json({
        status: false,
        message: `Invalid status. Valid values are: ${Object.values(
          STATUS_TYPE
        ).join(", ")}`,
      });
    }

    if (!staffId) {
      return res
        .status(200)
        .json({ status: false, message: "staffId must be required!" });
    }

    const staffPromise = staffId
      ? Staff.findOne({ _id: staffId })
      : Promise.resolve(null);

    const rolePromise = Role.findOne({
      role_name: req.body.role_name,
      status: { $ne: STATUS_TYPE.Deleted },
    });

    const [staff, roleExists] = await Promise.all([staffPromise, rolePromise]);

    if (staffId && !staff) {
      return res.status(200).json({
        status: false,
        message: "Staff not found",
      });
    }

    if (roleExists) {
      return res.status(200).json({
        status: false,
        message: "role_name already exists",
      });
    }

    const role = await Role.create({ ...req.body, created_by: staffId });

    return res.status(200).json({
      status: true,
      message: "Role has been created successfully by admin!",
      data: role,
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
    const { roleId } = req.query;
    const data = extractDataBySchema(Role, req.body);

    if (data.status && !isValidEnumData(STATUS_TYPE, data.status)) {
      return res.status(200).json({
        status: false,
        message: `Invalid status. Valid values are: ${Object.values(
          STATUS_TYPE
        ).join(", ")}`,
      });
    }

    if (!staffId) {
      return res
        .status(200)
        .json({ status: false, message: "staffId must be required!" });
    }
    if (!roleId) {
      return res
        .status(200)
        .json({ status: false, message: "roleId must be required!" });
    }

    const [staff, roleExists] = await Promise.all([
      Staff.findById(staffId),
      Role.findOne({
        role_name: req.body.role_name,
        status: { $ne: STATUS_TYPE.Deleted },
      }),
    ]);

    if (!staff) {
      return res.status(200).json({
        status: false,
        message: `Staff not found`,
      });
    }

    if (roleExists && roleId !== roleExists._id.toString()) {
      return res.status(200).json({
        status: false,
        message: "role_name already exists",
      });
    }

    const role = await Role.findByIdAndUpdate(
      { _id: roleId, status: { $ne: STATUS_TYPE.Deleted } },
      { ...data, updated_by: staffId },
      { new: true }
    );

    if (!role) {
      return res.status(200).json({
        status: false,
        message: `Role not found`,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Role has been updated successfully",
      data: role,
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
    const staffId = req.admin._id;
    const { roleId } = req.query;
    if (!staffId) {
      return res
        .status(200)
        .json({ status: false, message: "staffId must be required!" });
    }
    if (!roleId)
      return res
        .status(200)
        .json({ status: false, message: "roleId must be required!" });
    const staff = await Staff.findById(staffId);
    if (!staff)
      return res.status(200).json({
        status: false,
        message: `Role not found`,
      });
    const role = await Role.findByIdAndUpdate(
      { _id: roleId },
      { status: STATUS_TYPE.Deleted, deleted_by: staffId },
      { new: true }
    );
    return res.status(200).json({
      status: true,
      message: "Role has been updated successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getRole = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Invalid details!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let dateFilterQuery = {};

    if (req.query.startDate !== "All" || req.query.endDate !== "All") {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      dateFilterQuery = {
        createAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }
    const roles = await Role.aggregate([
      {
        $match: { status: { $ne: STATUS_TYPE.Deleted }, ...dateFilterQuery },
      },
      {
        $lookup: {
          from: "rolepermissiondetails",
          localField: "_id",
          foreignField: "role_id",
          as: "rolePermissions",
        },
      },
      {
        $lookup: {
          from: "permissions",
          localField: "rolePermissions.permission_id",
          foreignField: "_id",
          as: "permissions",
        },
      },
      {
        $addFields: {
          rolePermissions: {
            $map: {
              input: "$rolePermissions",
              as: "rolePerm",
              in: {
                _id: "$$rolePerm._id",
                role_id: "$$rolePerm.role_id",
                permission_id: "$$rolePerm.permission_id",
                updated_by: "$$rolePerm.updated_by",
                deleted_by: "$$rolePerm.deleted_by",
                createdAt: "$$rolePerm.createdAt",
                updatedAt: "$$rolePerm.updatedAt",
                permission_Details: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$permissions",
                        as: "perm",
                        cond: { $ne: ["$$perm.status", "IsDelete"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $unset: "permissions",
      },
      { $sort: { createdAt: -1 } },
      { $skip: (start - 1) * limit },
      { $limit: limit },
    ]).exec();

    return res.status(200).json({
      status: true,
      message: "finally, get all Role",
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { roleId } = req.query;
    if (!roleId)
      return res
        .status(200)
        .json({ status: false, message: "roleId must be required!" });
    const roles = await Role.aggregate([
      {
        $match: {
          _id: roleId,
          status: { $ne: STATUS_TYPE.Deleted },
        },
      },
      {
        $lookup: {
          from: "rolepermissiondetails",
          localField: "_id",
          foreignField: "role_id",
          as: "rolePermissions",
        },
      },
      {
        $lookup: {
          from: "permissions",
          localField: "rolePermissions.permission_id",
          foreignField: "_id",
          as: "permissions",
        },
      },
      {
        $addFields: {
          rolePermissions: {
            $map: {
              input: "$rolePermissions",
              as: "rolePerm",
              in: {
                _id: "$$rolePerm._id",
                role_id: "$$rolePerm.role_id",
                permission_id: "$$rolePerm.permission_id",
                updated_by: "$$rolePerm.updated_by",
                deleted_by: "$$rolePerm.deleted_by",
                createdAt: "$$rolePerm.createdAt",
                updatedAt: "$$rolePerm.updatedAt",
                permission_Details: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$permissions",
                        as: "perm",
                        cond: { $ne: ["$$perm.status", "IsDelete"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $unset: "permissions",
      },
    ]).exec();
    return res.status(200).json({
      status: true,
      message: "finally, get all Role",
      data: roles[0],
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
