const staffController = require("../../controllers/admin/staff.controller");

const express = require("express");
const AdminMiddleware = require("../../middleware/admin.middleware");
const route = express.Router();

route.get("/getStaff", AdminMiddleware, staffController.getStaff);
route.get("/getStaffProfile", AdminMiddleware, staffController.getProfile);

route.post("/create", AdminMiddleware, staffController.create);
route.post("/forgotPassword", staffController.forgotPassword);
route.post("/login", staffController.login);
route.post("/setPassword", AdminMiddleware, staffController.setPassword);

route.put("/update", AdminMiddleware, staffController.update);
route.patch("/updatePassword", AdminMiddleware, staffController.updatePassword);

route.delete("/delete", AdminMiddleware, staffController.delete);

module.exports = route;
