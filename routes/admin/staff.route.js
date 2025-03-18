const staffController = require("../../controllers/admin/staff.controller");

const express = require("express");
const route = express.Router();

route.get("/getStaff", staffController.getStaff);
route.get("/getStaffProfile", staffController.getProfile);

route.post("/create", staffController.create);

route.put("/update", staffController.update);

module.exports = route;
