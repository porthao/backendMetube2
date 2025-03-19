const staffController = require("../../controllers/admin/staff.controller");

const express = require("express");
const route = express.Router();

route.get("/getStaff", staffController.getStaff);
route.get("/getStaffProfile", staffController.getProfile);

route.post("/create", staffController.create);
route.post("/forgotPassword", staffController.forgotPassword);
route.post("/login", staffController.login);
route.post("/setPassword", staffController.setPassword);

route.put("/update", staffController.update);
route.patch("/updatePassword", staffController.updatePassword);

route.delete("/delete", staffController.delete);

module.exports = route;
