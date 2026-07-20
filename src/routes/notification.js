const express = require("express");
const router = express.Router();

const { getNotifications } = require("../controllers/notification");
const { updateRead } = require("../controllers/notification");
const { activeNotify } = require("../controllers/notification");

// auth middleware
const {auth} = require("../../authentication/auth");

router.get("/all", auth, getNotifications);
router.put("/isread", auth, updateRead);
router.get("/active", auth, activeNotify);
module.exports = router;