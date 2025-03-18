const permissionController = require("../../controllers/admin/permission.controller");
const express = require("express");

const route = express.Router();
route.post("/create", permissionController.create);

module.exports = route;
