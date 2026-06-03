const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reportsController");
const { authenticate } = require("../middleware/auth");

router.get("/summary", authenticate, ctrl.summary);
router.get("/drivers", authenticate, ctrl.driversReport);
router.get("/vehicles", authenticate, ctrl.vehiclesReport);
router.get("/loads", authenticate, ctrl.loadsReport);

module.exports = router;
