const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/loadController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, ctrl.listHistory);
router.get("/:id", authenticate, ctrl.getOneHistory);

module.exports = router;
