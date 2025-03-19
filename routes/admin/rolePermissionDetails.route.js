const express = require("express");

const rolePermissionDetailsController = require("../../controllers/admin/rolePermissionDetails.controller");
const route = express.Router();

route.post("/create", rolePermissionDetailsController.create);
route.put("/update", rolePermissionDetailsController.update);
route.delete("/delete", rolePermissionDetailsController.delete);

module.exports = route;
