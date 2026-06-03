const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, vehicleController.list);
router.get("/:id", authenticate, vehicleController.getOne);
router.post("/", authenticate, authorize("SUPER_ADMIN", "EDITOR"), vehicleController.create);
router.patch("/:id", authenticate, authorize("SUPER_ADMIN", "EDITOR"), vehicleController.update);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), vehicleController.remove);

module.exports = router;
