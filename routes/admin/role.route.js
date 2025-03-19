
const express = require("express")
const RoleController = require("../../controllers/admin/role.controller")

const route = express.Router()



route.get("/getRole", RoleController.getRole)

route.post("/create", RoleController.create)

route.put("/update", RoleController.update)

route.delete("/delete", RoleController.delete)



module.exports = route