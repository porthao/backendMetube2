const express = require("express");
const RoleController = require("../../controllers/admin/role.controller");
const AdminMiddleware = require("../../middleware/admin.middleware");

const route = express.Router();

route.get("/getRole", AdminMiddleware, RoleController.getRole);
route.get("/getRoleById", AdminMiddleware, RoleController.getRoleById);

route.post("/create", AdminMiddleware, RoleController.create);

route.put("/update", AdminMiddleware, RoleController.update);

route.delete("/delete", AdminMiddleware, RoleController.delete);

module.exports = route;
