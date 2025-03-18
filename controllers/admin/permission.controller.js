const { extractDataBySchema } = require("../../util/validate");
const Permission = require("../../models/permission.model");
exports.create = async (req, res) => {
  try {
    const data = extractDataBySchema(Permission, req.body);
    const permission = await Permission.create(data);

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
