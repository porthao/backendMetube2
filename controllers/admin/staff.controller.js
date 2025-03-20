const Staff = require("../../models/staff.model.js");
const Cryptr = require("cryptr");
const nodemailer = require("nodemailer");
//jwt token
const jwt = require("jsonwebtoken");
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
const { default: mongoose } = require("mongoose");

exports.create = async (req, res) => {
  try {
    const { staffId } = req.admin._id;

    // if (!staffId) {
    //   return res
    //     .status(200)
    //     .json({ status: false, message: "staffId must be required!" });
    // }

    const requiredFields = getRequiredFields(Staff);
    const validateInput = validateKeyInput(requiredFields, req.body);

    if (validateInput.length > 0)
      return res.status(200).json({
        status: false,
        message: `Required data fields missing: ${validateInput.join(", ")}`,
      });

    if (req.body.status && !isValidEnumData(STATUS_TYPE, req.body.status)) {
      return res.status(200).json({
        status: false,
        message: `Invalid status. Valid values are: ${Object.values(
          STATUS_TYPE
        ).join(", ")}`,
      });
    }

    if (staffId) {
      const staff = await Staff.findOne({
        status: { $ne: STATUS_TYPE.Deleted },
        _id: staffId,
      });
      if (!staff) {
        return res.status(200).json({
          status: false,
          message: `Staff not found`,
        });
      }
    }
    if (!isValidEnumData(GENDER_TYPE, req.body.gender)) {
      return res.status(200).json({
        status: false,
        message: `Invalid gender. Valid values are: ${Object.values(
          GENDER_TYPE
        ).join(", ")}`,
      });
    }

    const existsStaff = await Staff.findOne({
      status: { $ne: STATUS_TYPE.Deleted },
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });
    if (existsStaff)
      return res.status(200).json({
        status: false,
        message: "Email or Username already exists",
      });

    const hashPassword = cryptr.encrypt(req.body.password);
    const new_name = generateRandomStringWithTime(5);

    const staff = await Staff.create({
      ...req.body,
      password: hashPassword,
      new_name,
      created_by: staffId,
    });

    return res.status(200).json({
      status: true,
      message: "Staff has been created successfully by staff!",
      data: staff,
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
    const { staffId } = req.query;
    const staffRefId = req.admin._id;
    if (!staffId) {
      return res.status(200).json({
        status: false,
        message: `staffId must be required!`,
      });
    }

    if (staffRefId) {
      const staff = await Staff.findById(staffRefId);
      if (!staff) {
        return res.status(200).json({
          status: false,
          message: `StaffRef not found`,
        });
      }
    }

    const data = extractDataBySchema(Staff, req.body);

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

    if (data.email || data.username) {
      const existsStaff = await Staff.findOne({
        status: { $ne: STATUS_TYPE.Deleted },
        $or: [{ email: req.body.email }, { username: req.body.username }],
      });
      if (existsStaff) {
        return res.status(200).json({
          status: false,
          message: "Email or Username already exists",
        });
      }
    }

    if (data._2fa_enable)
      data._2fa_enable = convertStringToNumber(data._2fa_enable);
    if (data._2fa_verify)
      data._2fa_verify = convertStringToNumber(data._2fa_verify);

    if (data.password) delete data.password;

    const staff = await Staff.findByIdAndUpdate(
      { _id: staffId },
      { ...data, updated_by: staffRefId },
      { new: true }
    );

    if (!staff) {
      return res.status(200).json({
        status: false,
        message: "Staff not found",
      });
    }

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

exports.delete = async (req, res) => {
  try {
    const { staffId } = req.query;
    const staffRefId = req.admin._id;
    if (!staffId) {
      return res.status(200).json({
        status: false,
        message: `staffId must be required!`,
      });
    }

    if (staffRefId) {
      const staff = await Staff.findById(staffRefId);
      if (!staff) {
        return res.status(200).json({
          status: false,
          message: `StaffRef not found`,
        });
      }
    }

    const staff = await Staff.findByIdAndUpdate(
      { _id: staffId },
      { status: STATUS_TYPE.Deleted, deleted_by: staffRefId },
      { new: true }
    );
    if (!staff) {
      return res.status(200).json({
        status: false,
        message: `StaffRef not found`,
      });
    }
    return res.status(200).json({
      status: true,
      message: "Staff has been delete successfully",
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
    const staff = await Staff.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.admin._id),
          status: { $ne: STATUS_TYPE.Deleted },
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "role_id",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $addFields: {
          role: {
            $filter: {
              input: "$role",
              as: "role",
              cond: { $ne: ["$$role.status", STATUS_TYPE.Deleted] },
            },
          },
        },
      },
    ]);

    if (!staff[0]) {
      return res.status(200).json({
        status: false,
        message: `Staff not found`,
      });
    }

    staff[0].password = cryptr.decrypt(staff[0]?.password);
    return res.status(200).json({
      status: true,
      message: "get staffProfile successfully",
      data: staff[0],
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
        $match: {
          ...dateFilterQuery,
          status: { $ne: STATUS_TYPE.Deleted },
        },
      },

      {
        $lookup: {
          from: "roles",
          localField: "role_id",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $addFields: {
          role: {
            $filter: {
              input: "$role",
              as: "role",
              cond: { $ne: ["$$role.status", STATUS_TYPE.Deleted] },
            },
          },
        },
      },
      { $unwind: "$role" },

      {
        $project: {
          first_name: 1,
          last_name: 1,
          gender: 1,
          email: 1,
          phone_number: 1,
          position: 1,
          username: 1,
          role_id: 1,
          createdAt: 1,
          updatedAt: 1,
          role: {
            role_name:1
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (start - 1) * limit },
      { $limit: limit },
    ]).exec();

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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Invalid details!" });
    }

    const staff = await Staff.findOne({
      status: { $eq: STATUS_TYPE.Active },
      email: email.trim(),
    });

    if (!staff) {
      return res.status(200).json({
        status: false,
        message: "Oops! staff not found with that email.",
      });
    }

    const decryptedPassword = cryptr.decrypt(staff.password);

    if (decryptedPassword !== password) {
      return res.status(200).json({
        status: false,
        message: "Oops! Password doesn't match!",
      });
    }

    const payload = {
      _id: staff._id,
      username: staff.username,
      email: staff.email,
      password: staff.password,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return res.status(200).json({
      status: true,
      message: "staff login Successfully!",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    if (!req.body.email) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!" });
    }
    const staff = await Staff.findOne({
      status: { $ne: STATUS_TYPE.Deleted },
      email: req.body.email.trim(),
    });
    if (!staff) {
      return res.status(200).json({
        status: false,
        message: "Staff does not found with that email.",
      });
    }
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process?.env?.EMAIL,
        pass: process?.env?.PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    var tab = "";
    tab += "<!DOCTYPE html><html><head>";
    tab +=
      "<meta charset='utf-8'><meta http-equiv='x-ua-compatible' content='ie=edge'><meta name='viewport' content='width=device-width, initial-scale=1'>";
    tab += "<style type='text/css'>";
    tab +=
      " @media screen {@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 400;}";
    tab +=
      "@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 700;}}";
    tab +=
      "body,table,td,a {-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }";
    tab += "table,td {mso-table-rspace: 0pt;mso-table-lspace: 0pt;}";
    tab += "img {-ms-interpolation-mode: bicubic;}";
    tab +=
      "a[x-apple-data-detectors] {font-family: inherit !important;font-size: inherit !important;font-weight: inherit !important;line-height:inherit !important;color: inherit !important;text-decoration: none !important;}";
    tab += "div[style*='margin: 16px 0;'] {margin: 0 !important;}";
    tab +=
      "body {width: 100% !important;height: 100% !important;padding: 0 !important;margin: 0 !important;}";
    tab += "table {border-collapse: collapse !important;}";
    tab += "a {color: #1a82e2;}";
    tab +=
      "img {height: auto;line-height: 100%;text-decoration: none;border: 0;outline: none;}";
    tab += "</style></head><body>";
    tab += "<table border='0' cellpadding='0' cellspacing='0' width='100%'>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'>";
    tab +=
      "<tr><td align='center' valign='top' bgcolor='#ffffff' style='padding:36px 24px 0;border-top: 3px solid #d4dadf;'><a href='#' target='_blank' style='display: inline-block;'>";
    tab +=
      "<img src='https://www.stampready.net/dashboard/editor/user_uploads/zip_uploads/2018/11/23/5aXQYeDOR6ydb2JtSG0p3uvz/zip-for-upload/images/template1-icon.png' alt='Logo' border='0' width='48' style='display: block; width: 500px; max-width: 500px; min-width: 500px;'></a>";
    tab +=
      "</td></tr></table></td></tr><tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff'>";
    tab +=
      "<h1 style='margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;'>SET YOUR PASSWORD</h1></td></tr></table></td></tr>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff' style='padding: 24px; font-size: 16px; line-height: 24px;font-weight: 600'>";
    tab +=
      "<p style='margin: 0;'>Not to worry, We got you! Let's get you a new password.</p></td></tr><tr><td align='left' bgcolor='#ffffff'>";
    tab +=
      "<table border='0' cellpadding='0' cellspacing='0' width='100%'><tr><td align='center' bgcolor='#ffffff' style='padding: 12px;'>";
    tab +=
      "<table border='0' cellpadding='0' cellspacing='0'><tr><td align='center' style='border-radius: 4px;padding-bottom: 50px;'>";
    tab +=
      "<a href='" +
      process?.env?.baseURL +
      "changePassword/" +
      staff._id +
      "' target='_blank' style='display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px;background: #FE9A16; box-shadow: -2px 10px 20px -1px #33cccc66;'>SUBMIT PASSWORD</a>";
    tab +=
      "</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>";

    var mailOptions = {
      from: process?.env?.EMAIL,
      to: req.body.email?.trim(),
      subject: `Sending email from ${process?.env?.appName} for Password Security`,
      html: tab,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      console.log("mailOptions :>> ", mailOptions);
      if (error) {
        console.log(error);
        return res.status(200).json({
          status: false,
          message: "Email send Error",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Email send for forget the password!",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { staffId } = req.query;
    const staffRefId = req.admin._id;

    if (staffRefId) {
      const staff = await Staff.findById(staffRefId);
      if (!staff) {
        return res.status(200).json({
          status: false,
          message: `StaffRef not found`,
        });
      }
    }
    const staff = await Staff.findOne({
      _id: staffId ?? req.admin._id,
      status: STATUS_TYPE.Active,
    });
    if (!staff) {
      return res
        .status(200)
        .json({ status: false, message: "Staff does not found." });
    }

    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! Invalid details." });
    }

    if (cryptr.decrypt(staff.password) !== req.body.oldPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! Password doesn't match!",
      });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password don't match!",
      });
    }

    const hash = cryptr.encrypt(req.body.newPass);
    staff.updated_by = req.admin._id;
    staff.password = hash;
    await staff.save();

    return res.status(200).json({
      status: true,
      message: "Password changed successfully!",
      staff: staff,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const staff = await Staff.findById(req?.admin._id);
    if (!staff) {
      return res
        .status(200)
        .json({ status: false, message: "Staff does not found." });
    }

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password don't match!",
      });
    }

    staff.password = cryptr.encrypt(newPassword);
    staff.updated_by = req?.admin._id;
    await staff.save();

    staff.password = cryptr.decrypt(staff?.password);

    return res.status(200).json({
      status: true,
      message: "Password has been updated Successfully.",
      staff,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Internal Server Error" });
  }
};
