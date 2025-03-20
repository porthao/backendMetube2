const express = require("express");

const rolePermissionDetailsController = require("../../controllers/admin/rolePermissionDetails.controller");
const AdminMiddleware = require("../../middleware/admin.middleware");
const route = express.Router();

route.post("/create", AdminMiddleware, rolePermissionDetailsController.create);
route.put("/update", AdminMiddleware, rolePermissionDetailsController.update);
route.delete(
  "/delete",
  AdminMiddleware,
  rolePermissionDetailsController.delete
);

module.exports = route;
