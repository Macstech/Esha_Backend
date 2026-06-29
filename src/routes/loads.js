const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/loadController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, ctrl.list);
router.get("/:id", authenticate, ctrl.getOne);
router.post("/", authenticate, authorize("ADMIN", "SUPER_ADMIN", "EDITOR", "VENDOR"), ctrl.create);
router.patch("/:id", authenticate, authorize("ADMIN", "VENDOR", "SUPERVISOR"), ctrl.update);
router.delete("/:id", authenticate, authorize("ADMIN"), ctrl.remove);

module.exports = router;
