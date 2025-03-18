
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
        if (staffId) {
            const staff = await Staff.findOne({ _id: staffId });
            if (!staff) {
                return res.status(200).json({
                    status: false,
                    message: `Staff not found`,
                });
            }
        }
        const role = await Role.create({ ...req.body });
        // Success response
        return res.status(200).json({
            status: true,
            message: "Staff has been created successfully by admin!",
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
        const data = extractDataBySchema(Role, req.data)

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
        if (!roleId) return res
            .status(200)
            .json({ status: false, message: "roleId must be required!" });
        const staff = await Staff.findById(staffId);
        if (!staff)
            return res.status(200).json({
                status: false,
                message: `Staff not found`,
            });
        const role = await Role.findByIdAndUpdate({ _id: roleId }, { ...data, updated_by: staffId })
        return res.status(200).json({
            status: true,
            message: "Staff has been updated successfully",
            data: role,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
}

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
        const role = await Role.aggregate([{
            $match: { ...dateFilterQuery },
        }, { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },])
        return res.status(200).json({
            status: true,
            message: "finally, get all staff",
            data: role,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
}