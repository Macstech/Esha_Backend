const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, userController.list);
router.get("/:id", authenticate, userController.getOne);
router.post("/", authenticate, authorize("ADMIN"), userController.create);
router.patch("/:id", authenticate, authorize("ADMIN"), userController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), userController.remove);

module.exports = router;
