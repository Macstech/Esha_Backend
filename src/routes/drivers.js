const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, driverController.list);
router.get("/:id", authenticate, driverController.getOne);
router.post("/", authenticate, authorize("ADMIN"), driverController.create);
router.patch("/:id", authenticate, authorize("ADMIN"), driverController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), driverController.remove);

module.exports = router;
