const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, driverController.list);
router.get("/:id", authenticate, driverController.getOne);
router.post("/", authenticate, authorize("SUPER_ADMIN", "EDITOR"), driverController.create);
router.patch("/:id", authenticate, authorize("SUPER_ADMIN", "EDITOR"), driverController.update);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), driverController.remove);

module.exports = router;
