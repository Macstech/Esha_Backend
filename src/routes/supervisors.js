const express = require("express");
const router = express.Router();
const supervisorController = require("../controllers/supervisorController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, supervisorController.list);
router.get("/:id", authenticate, supervisorController.getOne);
router.post("/", authenticate, authorize("SUPER_ADMIN", "EDITOR"), supervisorController.create);
router.patch("/:id", authenticate, authorize("SUPER_ADMIN", "EDITOR"), supervisorController.update);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), supervisorController.remove);

module.exports = router;
