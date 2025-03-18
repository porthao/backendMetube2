const express = require("express");

const SecretKeyController = require("../../controllers/admin/secretKey.controller")

const checkAccessWithSecretKey = require("../../checkAccess");

const route = express.Router();

route.get("/getByDevice", SecretKeyController.getByDevice)

route.post("/create", checkAccessWithSecretKey(), SecretKeyController.store)

route.put("/update", checkAccessWithSecretKey(), SecretKeyController.update)

route.delete("/delete", checkAccessWithSecretKey(), SecretKeyController.delete)


module.exports = route