const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/vehicleTypeController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, ctrl.list);
router.get("/:id", authenticate, ctrl.getOne);
router.post("/", authenticate, authorize("SUPER_ADMIN", "EDITOR"), ctrl.create);
router.patch("/:id", authenticate, authorize("SUPER_ADMIN", "EDITOR"), ctrl.update);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), ctrl.remove);

module.exports = router;
