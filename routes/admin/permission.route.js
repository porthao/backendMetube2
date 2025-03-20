const permissionController = require("../../controllers/admin/permission.controller");
const express = require("express");
const AdminMiddleware = require("../../middleware/admin.middleware");

const route = express.Router();
route.post("/create", AdminMiddleware, permissionController.create);
route.get(
  "/getPermission",
  AdminMiddleware,
  permissionController.getPermission
);

module.exports = route;
