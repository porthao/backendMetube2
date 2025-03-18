
const mongoose = require("mongoose");

const secretKeySchema = mongoose.Schema({
    device: { type: String },
    secretKey: { type: String },
}, {
    timestamps: true,
    versionKey: false,
})

module.exports = mongoose.model("SecretKey", secretKeySchema)