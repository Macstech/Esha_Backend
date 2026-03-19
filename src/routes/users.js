const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, userController.list);
router.get("/:id", authenticate, userController.getOne);
router.post("/", authenticate, authorize("SUPER_ADMIN"), userController.create);
router.patch("/:id", authenticate, authorize("SUPER_ADMIN"), userController.update);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), userController.remove);

module.exports = router;
