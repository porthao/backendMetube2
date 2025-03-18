const Staff = require("../../models/staff.model.js");
const Cryptr = require("cryptr");

const cryptr = new Cryptr("myTotallySecretKey");
const {
  validateKeyInput,
  getRequiredFields,
  extractDataBySchema,
  convertStringToNumber,
  generateRandomStringWithTime,
  isValidEnumData,
} = require("../../util/validate.js");
const { STATUS_TYPE, GENDER_TYPE } = require("../../types/constant.js");

exports.create = async (req, res) => {
  try {
    const { staffId } = req.query;

    // Check if staff exists when staffId is provided
    if (!staffId) {
      return res
        .status(200)
        .json({ status: false, message: "staffId must be required!" });
    }
    if (staffId) {
      const staff = await Staff.findOne({ _id: staffId });
      if (!staff) {
        return res.status(200).json({
          status: false,
          message: `Staff not found`,
        });
      }
    }

    // Validate required fields
    const requiredFields = getRequiredFields(Staff);
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

    // Validate enum values for gender
    if (!isValidEnumData(GENDER_TYPE, req.body.gender)) {
      return res.status(200).json({
        status: false,
        message: `Invalid gender. Valid values are: ${Object.values(
          GENDER_TYPE
        ).join(", ")}`,
      });
    }

    // Check if email or username already exists
    const existsStaff = await Staff.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });
    if (existsStaff)
      return res.status(200).json({
        status: false,
        message: "Email or Username already exists",
      });

    // Encrypt password
    const hashPassword = cryptr.encrypt(req.body.password);
    const new_name = generateRandomStringWithTime(5);

    // Create new staff
    const staff = await Staff.create({
      ...req.body,
      password: hashPassword,
      new_name,
      created_by: staffId,
    });

    // Success response
    return res.status(200).json({
      status: true,
      message: "Staff has been created successfully by admin!",
      data: staff,
    });
  } catch (error) {
    // Catch any errors and send them in the response
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { staffId, staffRefId } = req.query;

    // Check if staffId is provided (must be required)
    if (!staffId || !staffRefId) {
      return res.status(200).json({
        status: false,
        message: `${!staffId ? "staffId" : "staffRefId"} must be required!`,
      });
    }

    // If staffRefId is provided, check if the staff exists
    if (staffRefId) {
      const staff = await Staff.findById(staffRefId);
      if (!staff) {
        return res.status(200).json({
          status: false,
          message: `StaffRef not found`,
        });
      }
    }

    // Extract data according to schema
    const data = extractDataBySchema(Staff, req.body);

    // Validate 'status' and 'gender' enums
    if (data.status && !isValidEnumData(STATUS_TYPE, data.status)) {
      return res.status(200).json({
        status: false,
        message: `Invalid status. Valid values are: ${Object.values(
          STATUS_TYPE
        ).join(", ")}`,
      });
    }

    if (data.gender && !isValidEnumData(GENDER_TYPE, data.gender)) {
      return res.status(200).json({
        status: false,
        message: `Invalid gender. Valid values are: ${Object.values(
          GENDER_TYPE
        ).join(", ")}`,
      });
    }

    // Check if email or username already exists
    if (data.email || data.username) {
      const existsStaff = await Staff.findOne({
        $or: [{ email: data.email }, { username: data.username }],
      });
      if (existsStaff) {
        return res.status(200).json({
          status: false,
          message: "Email or Username already exists",
        });
      }
    }

    // Convert 2FA values if provided
    if (data._2fa_enable)
      data._2fa_enable = convertStringToNumber(data._2fa_enable);
    if (data._2fa_verify)
      data._2fa_verify = convertStringToNumber(data._2fa_verify);

    // Update the staff with the new data
    const staff = await Staff.findByIdAndUpdate(
      { _id: staffId },
      { ...data, updated_by: staffRefId },
      { new: true } // Returns the updated staff
    );

    if (!staff) {
      return res.status(200).json({
        status: false,
        message: "Staff not found",
      });
    }

    // Return success response
    return res.status(200).json({
      status: true,
      message: "Staff has been updated successfully",
      data: staff,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { staffId } = req.query;
    if (!staffId) {
      return res
        .status(200)
        .json({ status: false, message: "staffId must be required!" });
    }
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(200).json({
        status: false,
        message: `Staff not found`,
      });
    }
    return res.status(200).json({
      status: true,
      message: "get staffProfile successfully",
      data: staff,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
exports.getStaff = async (req, res) => {
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

    const staff = await Staff.aggregate([
      {
        $match: { ...dateFilterQuery },
      },
      {
        $project: {
          first_name: 1,
          last_name: 1,
          gender: 1,
          email: 1,
          phone_number: 1,
          dob: 1,
          new_name: 1,
          position: 1,
          username: 1,
          // password: 1,
          address: 1,
          status: 1,
          _2fa_qr_code: 1,
          _2fa_enable: 1,
          _2fa_verify: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: (start - 1) * limit },
      { $limit: limit },
    ]);

    return res.status(200).json({
      status: true,
      message: "finally, get all staff",
      data: staff,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
