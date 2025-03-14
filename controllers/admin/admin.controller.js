const Admin = require("../../models/admin.model");

//jwt token
const jwt = require("jsonwebtoken");

//nodemailer
const nodemailer = require("nodemailer");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");


//jago-maldar
const LiveUser = require("jago-maldar");

//import model
const Login = require("../../models/login.model");
const checkInModel = require("../../models/checkIn.model");

//create admin
// exports.store = async (req, res) => {
//   try {

//     if (!req.body.email || !req.body.password || !req.body.code) {
//       return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
//     }

//     function _0x704b(_0x2a0521, _0x53c125) {
//       const _0x21f338 = _0x21f3();
//       return (
//         (_0x704b = function (_0x704bd2, _0x1035fa) {
//           _0x704bd2 = _0x704bd2 - 0x18e;
//           let _0x5ada9b = _0x21f338[_0x704bd2];
//           return _0x5ada9b;
//         }

//         ),
//         _0x704b(_0x2a0521, _0x53c125)
//       );
//     }

//     function _0x21f3() {
//       const _0x40a55e = [
//         "5466152JTbkrN",
//         "18MlKzFF",
//         "email",
//         "body",
//         "21ENoFgF",
//         "Admin\x20created\x20Successfully!",
//         "860322jMsoSm",
//         "36hyTkos",
//         "password",
//         "184520OMsLXe",
//         "purchaseCode",
//         "trim",
//         "save",
//         "1557385NSdwxS",
//         "encrypt",
//         "status",
//         "Purchase\x20code\x20is\x20not\x20valid.",
//         "login",
//         "895207WbdgEp",
//         "302630NUzpjB",
//         "code",
//         "3642807KgyjeY",
//         "json",
//       ];

//       _0x21f3 = function () {
//         return _0x40a55e;
//       };
//       return _0x21f3();
//     }
//     const _0xc37b76 = _0x704b;
//     (function (_0xd713b7, _0x55b06c) {

//       const _0x524539 = _0x704b,
//         _0x5f2083 = _0xd713b7();
//       while (!![]) {
//         try {
//           const _0xdfaa3c =
//             parseInt(_0x524539(0x192)) / 0x1 +
//             -parseInt(_0x524539(0x19d)) / 0x2 +
//             (parseInt(_0x524539(0x19b)) / 0x3) * (-parseInt(_0x524539(0x1a0)) / 0x4) +
//             (-parseInt(_0x524539(0x1a4)) / 0x5) * (parseInt(_0x524539(0x198)) / 0x6) +
//             parseInt(_0x524539(0x195)) / 0x7 +
//             parseInt(_0x524539(0x197)) / 0x8 +
//             (parseInt(_0x524539(0x19e)) / 0x9) * (parseInt(_0x524539(0x193)) / 0xa);

//           if (_0xdfaa3c === _0x55b06c) break;
//           else _0x5f2083["push"](_0x5f2083["shift"]());
//         } catch (_0x4711c8) {
//           _0x5f2083["push"](_0x5f2083["shift"]());
//         }
//       }
//     })(_0x21f3, 0x81fcb);
//     console.log('req[_0xc37b76(0x19a)][_0xc37b76(0x194)], 0x312c8bf :>> ', req[_0xc37b76(0x19a)][_0xc37b76(0x194)], 0x312c8bf);
//     console.log('object :>> -------------------------------------------------------------------------------------');
//     const data = await LiveUser(req[_0xc37b76(0x19a)][_0xc37b76(0x194)], 0x312c8bf);


//     if (data) {
//       const admin = new Admin();
//       (admin[_0xc37b76(0x199)] = req?.[_0xc37b76(0x19a)]?.[_0xc37b76(0x199)]?.[_0xc37b76(0x1a2)]()),
//         (admin[_0xc37b76(0x19f)] = cryptr[_0xc37b76(0x18e)](req[_0xc37b76(0x19a)][_0xc37b76(0x19f)])),
//         (admin[_0xc37b76(0x1a1)] = req?.[_0xc37b76(0x19a)]?.[_0xc37b76(0x194)]?.[_0xc37b76(0x1a2)]()),
//         await admin[_0xc37b76(0x1a3)]();
//       const login = await Login["findOne"]({});
//       if (!login) {
//         const newLogin = new Login();
//         (newLogin[_0xc37b76(0x191)] = !![]), await newLogin[_0xc37b76(0x1a3)]();
//       } else (login["login"] = !![]), await login[_0xc37b76(0x1a3)]();
//       return res[_0xc37b76(0x18f)](0xc8)[_0xc37b76(0x196)]({ status: !![], message: _0xc37b76(0x19c), admin: admin });
//     } else {

//       return res[_0xc37b76(0x18f)](0xc8)[_0xc37b76(0x196)]({ status: ![], message: _0xc37b76(0x190) });
//     }
//   } catch (error) {

//     return res.status(500).json({
//       status: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

exports.store = async (req, res) => {
  try {
    const { email, password, code } = req.body;

    if (!email || !password || !code) {
      return res.status(400).json({ status: false, message: "Oops! Invalid details!" });
    }

  

    // const data = await LiveUser(code, "51562687");

    // if (data) {
      const admin = new Admin();
      admin.email = email.trim();
      admin.password = cryptr.encrypt(password);
      admin.purchaseCode = code.trim();
      await admin.save();

      let login = await Login.findOne({});
      if (!login) {
        login = new Login();
      }
      login.status = true;
      await login.save();

      return res.status(200).json({ status: true, message: "Admin created Successfully!", admin });
    // } else {
    //   return res.status(400).json({ status: false, message: "Purchase code is not valid." });
    // }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};


// admin login
// exports.login = async (req, res) => {
//   try {
//     if (!req.body.email || !req.body.password) {
//       return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
//     }

//     function _0x2e16() {
//       const _0x4570e0 = [

//         "749418QLUPVC",
//         "JWT_SECRET",
//         "_id",
//         "Purchase\x20code\x20is\x20not\x20valid.",
//         "Oops\x20!\x20Password\x20doesn\x27t\x20matched!",
//         "6299704BtkBmf",
//         "185802BwPxJf",
//         "name",
//         "39039960RHMUai",
//         "497357OFvhpO",
//         "body",
//         "json",
//         "env",
//         "purchaseCode",
//         "199735tWAKDr",
//         "3660555UrGlEL",
//         "email",
//         "trim",
//         "status",
//         "Admin\x20login\x20Successfully!",
//         "11fmniag",
//         "password",
//       ];
//       _0x2e16 = function () {
//         return _0x4570e0;
//       };
//       return _0x2e16();
//     }
//     const _0x22691d = _0x5835;
//     (function (_0x438ae9, _0x2b636d) {
//       const _0x7235f7 = _0x5835,
//         _0x3c6015 = _0x438ae9();
//       while (!![]) {
//         try {
//           const _0xdd4982 =
//             (parseInt(_0x7235f7(0x1d7)) / 0x1) * (-parseInt(_0x7235f7(0x1c9)) / 0x2) +
//             -parseInt(_0x7235f7(0x1d2)) / 0x3 +
//             -parseInt(_0x7235f7(0x1de)) / 0x4 +
//             -parseInt(_0x7235f7(0x1d1)) / 0x5 +
//             -parseInt(_0x7235f7(0x1d9)) / 0x6 +
//             parseInt(_0x7235f7(0x1cc)) / 0x7 +
//             parseInt(_0x7235f7(0x1cb)) / 0x8;
//           if (_0xdd4982 === _0x2b636d) break;
//           else _0x3c6015["push"](_0x3c6015["shift"]());
//         } catch (_0x3c2644) {
//           _0x3c6015["push"](_0x3c6015["shift"]());
//         }
//       }
//     })(_0x2e16, 0xec9d6);
//     const admin = await Admin["findOne"]({ email: req[_0x22691d(0x1cd)]["email"][_0x22691d(0x1d4)]() })

//     data = await LiveUser(admin?.[_0x22691d(0x1d0)], 0x312c8bf);
//     function _0x5835(_0x5b2a34, _0x3e397e) {
//       const _0x2e168a = _0x2e16();
//       return (
//         (_0x5835 = function (_0x58354a, _0x3d73ec) {
//           _0x58354a = _0x58354a - 0x1c9;
//           let _0x3f5866 = _0x2e168a[_0x58354a];
//           return _0x3f5866;
//         }),
//         _0x5835(_0x5b2a34, _0x3e397e)
//       );
//     }
//     if (data) {
//       if (!admin)
//         return res[_0x22691d(0x1d5)](0xc8)[_0x22691d(0x1ce)]({
//           status: ![],
//           message: "Oops\x20!\x20admin\x20does\x20not\x20found\x20with\x20that\x20email.",
//         });
//       if (cryptr["decrypt"](admin[_0x22691d(0x1d8)]) !== req[_0x22691d(0x1cd)][_0x22691d(0x1d8)]) return res["status"](0xc8)[_0x22691d(0x1ce)]({ status: ![], message: _0x22691d(0x1dd) });
//       const payload = {
//         _id: admin?.[_0x22691d(0x1db)],
//         name: admin?.[_0x22691d(0x1ca)],
//         email: admin?.[_0x22691d(0x1d3)],
//         image: admin?.["image"],
//         password: admin?.["password"],
//       },
//         token = jwt["sign"](payload, process?.[_0x22691d(0x1cf)]?.[_0x22691d(0x1da)]);
//       return res["status"](0xc8)[_0x22691d(0x1ce)]({ status: !![], message: _0x22691d(0x1d6), token: token });
//     } else return res["status"](0xc8)[_0x22691d(0x1ce)]({ status: ![], message: _0x22691d(0x1dc) });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       status: false,
//       message: error.message || "Internal Sever Error",
//     });
//   }
// };




exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const admin = await Admin.findOne({ email: email.trim() });

    if (!admin) {
      return res.status(200).json({
        status: false,
        message: "Oops! Admin not found with that email.",
      });
    }

    // const data = await LiveUser(admin._id, 0x312c8bf);

    // if (!data) {
    //   return res.status(200).json({
    //     status: false,
    //     message: "Purchase code is not valid.",
    //   });
    // }

    const decryptedPassword = cryptr.decrypt(admin.password);
    
    if (decryptedPassword !== password) {
      return res.status(200).json({
        status: false,
        message: "Oops! Password doesn't match!",
      });
    }

    const payload = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
      password: admin.password,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return res.status(200).json({
      status: true,
      message: "Admin login Successfully!",
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
//get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found." });
    }

    const data = await Admin.findById(admin._id);
    data.password = cryptr.decrypt(data.password);

    return res.status(200).json({ status: true, message: "finally, admin profile get by admin!", user: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update admin profile
exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      if (req?.body?.image) {
        //delete the old image from digitalOcean Spaces
        const urlParts = req?.body?.image?.split("/");
        const keyName = urlParts?.pop(); //remove the last element
        const folderStructure = urlParts?.slice(3)?.join("/"); //Join elements starting from the 4th element
        await deleteFromSpace({ folderStructure, keyName });
      }

      return res.status(200).json({ status: false, message: "admin does not found." });
    }

    if (req?.body?.image) {
      //delete the old image from digitalOcean Spaces
      const urlParts = admin?.image?.split("/");
      const keyName = urlParts?.pop(); //remove the last element
      const folderStructure = urlParts?.slice(3)?.join("/"); //Join elements starting from the 4th element
      await deleteFromSpace({ folderStructure, keyName });

      admin.image = req?.body?.image ? req?.body?.image : admin.image;
    }

    admin.name = req?.body?.name ? req?.body?.name : admin.name;
    admin.email = req?.body?.email ? req?.body?.email.trim() : admin.email;
    await admin.save();

    const data = await Admin.findById(admin._id);
    data.password = cryptr.decrypt(data.password);

    return res.status(200).json({
      status: true,
      message: "Admin profile updated Successfully!",
      admin: data,
    });
  } catch (error) {
    if (req?.body?.image) {
      //delete the old image from digitalOcean Spaces
      const urlParts = req?.body?.image?.split("/");
      const keyName = urlParts?.pop(); //remove the last element
      const folderStructure = urlParts?.slice(3)?.join("/"); //Join elements starting from the 4th element
      await deleteFromSpace({ folderStructure, keyName });
    }

    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//send email for forgot the password (forgot password)
exports.forgotPassword = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const admin = await Admin.findOne({ email: req.body.email.trim() });
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found with that email." });
    }
console.log('object :>> ', process?.env?.PASSWORD);
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
    tab += "<meta charset='utf-8'><meta http-equiv='x-ua-compatible' content='ie=edge'><meta name='viewport' content='width=device-width, initial-scale=1'>";
    tab += "<style type='text/css'>";
    tab += " @media screen {@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 400;}";
    tab += "@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 700;}}";
    tab += "body,table,td,a {-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }";
    tab += "table,td {mso-table-rspace: 0pt;mso-table-lspace: 0pt;}";
    tab += "img {-ms-interpolation-mode: bicubic;}";
    tab +=
      "a[x-apple-data-detectors] {font-family: inherit !important;font-size: inherit !important;font-weight: inherit !important;line-height:inherit !important;color: inherit !important;text-decoration: none !important;}";
    tab += "div[style*='margin: 16px 0;'] {margin: 0 !important;}";
    tab += "body {width: 100% !important;height: 100% !important;padding: 0 !important;margin: 0 !important;}";
    tab += "table {border-collapse: collapse !important;}";
    tab += "a {color: #1a82e2;}";
    tab += "img {height: auto;line-height: 100%;text-decoration: none;border: 0;outline: none;}";
    tab += "</style></head><body>";
    tab += "<table border='0' cellpadding='0' cellspacing='0' width='100%'>";
    tab += "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'>";
    tab += "<tr><td align='center' valign='top' bgcolor='#ffffff' style='padding:36px 24px 0;border-top: 3px solid #d4dadf;'><a href='#' target='_blank' style='display: inline-block;'>";
    tab +=
      "<img src='https://www.stampready.net/dashboard/editor/user_uploads/zip_uploads/2018/11/23/5aXQYeDOR6ydb2JtSG0p3uvz/zip-for-upload/images/template1-icon.png' alt='Logo' border='0' width='48' style='display: block; width: 500px; max-width: 500px; min-width: 500px;'></a>";
    tab +=
      "</td></tr></table></td></tr><tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff'>";
    tab += "<h1 style='margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;'>SET YOUR PASSWORD</h1></td></tr></table></td></tr>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff' style='padding: 24px; font-size: 16px; line-height: 24px;font-weight: 600'>";
    tab += "<p style='margin: 0;'>Not to worry, We got you! Let's get you a new password.</p></td></tr><tr><td align='left' bgcolor='#ffffff'>";
    tab += "<table border='0' cellpadding='0' cellspacing='0' width='100%'><tr><td align='center' bgcolor='#ffffff' style='padding: 12px;'>";
    tab += "<table border='0' cellpadding='0' cellspacing='0'><tr><td align='center' style='border-radius: 4px;padding-bottom: 50px;'>";
    tab +=
      "<a href='" +
      process?.env?.baseURL +
      "changePassword/" +
      admin._id +
      "' target='_blank' style='display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px;background: #FE9A16; box-shadow: -2px 10px 20px -1px #33cccc66;'>SUBMIT PASSWORD</a>";
    tab += "</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>";

    var mailOptions = {
      from: process?.env?.EMAIL,
      to: req.body.email?.trim(),
      subject: `Sending email from ${process?.env?.appName} for Password Security`,
      html: tab,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      console.log('mailOptions :>> ', mailOptions);
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
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update password
exports.updatePassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found." });
    }

    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    if (cryptr.decrypt(admin.password) !== req.body.oldPass) {
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
    admin.password = hash;
    await admin.save();

    return res.status(200).json({
      status: true,
      message: "Password changed successfully!",
      admin: admin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//set Password
exports.setPassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found." });
    }

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password don't match!",
      });
    }

    admin.password = cryptr.encrypt(newPassword);
    await admin.save();

    admin.password = cryptr.decrypt(admin?.password);

    return res.status(200).json({
      status: true,
      message: "Password has been updated Successfully.",
      admin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
