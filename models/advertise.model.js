const mongoose = require("mongoose");

const advertiseSchema = new mongoose.Schema(
  {
    isGoogle: { type: Boolean, default: false },
    android: {
      google: {
        interstitial: { type: String, default: "android_interstitial_id" },
        native: { type: String, default: "android_native_id" },
        reward: { type: String, default: "android_reward_id" },
      },
    },
    ios: {
      google: {
        interstitial: { type: String, default: "ios_interstitial_id" },
        native: { type: String, default: "ios_native_id" },
        reward: { type: String, default: "ios_reward_id" },
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

advertiseSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Advertise", advertiseSchema);
