// routes/system_route.js
const express = require("express");
const { authMiddleware } = require("../middleware/auth_middleware");
const { checkSystemUser } = require("../controller/system_controller");

const router = express.Router();

router.get("/",authMiddleware, checkSystemUser);

module.exports = router;