const SecretKey = require("../../models/secretKey.model")
exports.store = async (req, res) => {
    try {
        const { device, secretKey } = req.body
        if (!device || !secretKey) {
            return res.status(400).json({ status: false, message: "Oops! Invalid details! device, secretKey" });
        }

        const secret = new SecretKey();
        secret.device = device.trim();
        secret.secretKey = secretKey.trim();
        await secret.save()
        return res.status(200).json({
            status: true,
            message: "secretKey create Successfully",
            data: secret,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
}

exports.update = async (req, res) => {
    try {
        if (!req.body.secretKeyId)
            return res.status(400).json({ status: false, message: "Oops! Invalid details! device, secretKey" });
        const secret = new SecretKey.findOne({ _id: req.body.secretKeyId });
        if (!secret) return res.status(200).json({ status: false, message: "secretKey not found." });
        secret.device = !req.body.device ? secret.device : req.body.device;
        secret.secretKey = !req.body.secretKey ? secret.secretKey : req.body.secretKey;
        await secret.save();
        return res.status(200).json({
            status: true,
            message: "secretKey upldate Successfully",
            data: secret,
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
}
exports.delete = async (req, res) => {
    try {
        if (!req.body.secretKeyId)
            return res.status(400).json({ status: false, message: "Oops! Invalid details! device, secretKey" });
        const secret = new SecretKey.findOne({ _id: req.query.secretKeyId });
        if (!secret) return res.status(200).json({ status: false, message: "secretKey not found." });
        return res.status(200).json({
            status: true,
            message: "secretKey delete Successfully",
            data: secret,
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
}

exports.getByDevice = async (req, res) => {
    try {
        const { device } = req.body
        const secret = new SecretKey.findMany({ device })
        return res.status(200).json({
            status: true,
            message: "Retrive secretKey Successfully",
            data: secret,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
}