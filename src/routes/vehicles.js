const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, vehicleController.list);
router.get("/:id", authenticate, vehicleController.getOne);
router.post("/", authenticate, authorize("ADMIN"), vehicleController.create);
router.patch("/:id", authenticate, authorize("ADMIN"), vehicleController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), vehicleController.remove);

module.exports = router;
