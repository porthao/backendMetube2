const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const adRewardCoinController = require("../../controllers/client/adRewardCoin.controller");

route.get("/getAdRewardByUser", checkAccessWithSecretKey(), adRewardCoinController.getAdRewardByUser);

module.exports = route;
