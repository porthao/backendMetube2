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
    const { staffId } = req.query;
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
    // Check if staff exists when staffId is provided
    if (!staffId) {
      return res
        .status(200)
        .json({ status: false, message: "staffId must be required!" });
    }
    // Prepare staff query if staffId exists; otherwise, resolve to null
    const staffPromise = staffId
      ? Staff.findOne({ _id: staffId })
      : Promise.resolve(null);

    // Prepare the role query
    const rolePromise = Role.findOne({
      role_name: req.body.role_name,
      status: { $ne: STATUS_TYPE.IsDelete },
    });

    // Execute both queries concurrently
    const [staff, roleExists] = await Promise.all([staffPromise, rolePromise]);

    // If staffId was provided but no staff was found, return an error
    if (staffId && !staff) {
      return res.status(200).json({
        status: false,
        message: "Staff not found",
      });
    }

    // If a role with the same name (that is not deleted) exists, return an error
    if (roleExists) {
      return res.status(200).json({
        status: false,
        message: "role_name already exists",
      });
    }

    const role = await Role.create({ ...req.body, created_by: staffId });
    // Success response
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
    const { staffId, roleId } = req.query;
    const data = extractDataBySchema(Role, req.body);

    // Validate status if present
    if (data.status && !isValidEnumData(STATUS_TYPE, data.status)) {
      return res.status(200).json({
        status: false,
        message: `Invalid status. Valid values are: ${Object.values(
          STATUS_TYPE
        ).join(", ")}`,
      });
    }

    // Check if staffId and roleId are provided
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

    // Query for staff and role existence concurrently
    const [staff, roleExists] = await Promise.all([
      Staff.findById(staffId),
      Role.findOne({
        role_name: req.body.role_name,
        status: { $ne: STATUS_TYPE.IsDelete },
      }),
    ]);

    // Check if staff exists
    if (!staff) {
      return res.status(200).json({
        status: false,
        message: `Staff not found`,
      });
    }

    // Check if role_name already exists
    if (roleExists && roleId !== roleExists._id.toString()) {
      return res.status(200).json({
        status: false,
        message: "role_name already exists",
      });
    }

    // Update the role
    const role = await Role.findByIdAndUpdate(
      { _id: roleId, status: { $ne: STATUS_TYPE.IsDelete } },
      { ...data, updated_by: staffId },
      { new: true }
    );

    // If role not found after update
    if (!role) {
      return res.status(200).json({
        status: false,
        message: `Role not found`,
      });
    }

    // Return success response
    return res.status(200).json({
      status: true,
      message: "Role has been updated successfully",
      data: role,
    });
  } catch (error) {
    // Return error response
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { staffId, roleId } = req.query;
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
      { status: STATUS_TYPE.IsDelete, deleted_by: staffId },
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
    const role = await Role.aggregate([
      {
        $match: { ...dateFilterQuery, status: { $ne: STATUS_TYPE.IsDelete } },
      },
      {
        $lookup: {
          from: "rolepermissiondetails",
          localField: "_id",
          foreignField: "role_id",
          as: "rolePermission",
        },
      },
      {
        $lookup: {
          from: "permissions",
          localField: "rolePermission.permission_id",
          foreignField: "_id",
          as: "rolePermission.permission_Details",
        },
      },
      {
        $project: {
          _id: 1, // ต้องการแสดง _id ของ role
          role_name: 1, // ชื่อ role
          status: 1, // สถานะ
          createdAt: 1, // วันที่สร้าง
          updatedAt: 1, // วันที่อัปเดต
          rolePermission: {
            _id: 1, // rolePermission ID
            permission_id: 1, // ID ของ permission ที่เชื่อมโยงกับ rolePermission
            updated_by: 1, // ฟิลด์ updated_by ของ rolePermission
            createdAt: 1, // วันที่สร้าง rolePermission
            updatedAt: 1, // วันที่อัปเดต rolePermission
            permission_Details: {
              _id: 1, // permission ID
              permission_name: 1, // ชื่อ permission
              group_name: 1, // กลุ่ม permission
              status: 1, // สถานะ permission
              createdAt: 1, // วันที่สร้าง permission
              updatedAt: 1, // วันที่อัปเดต permission
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (start - 1) * limit },
      { $limit: limit },
    ]);

    return res.status(200).json({
      status: true,
      message: "finally, get all Role",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getRoleById = () => {
  try {
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
