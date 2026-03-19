const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, categoryController.list);
router.get("/:id", authenticate, categoryController.getOne);
router.post("/", authenticate, authorize("SUPER_ADMIN", "EDITOR"), categoryController.create);
router.patch("/:id", authenticate, authorize("SUPER_ADMIN", "EDITOR"), categoryController.update);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), categoryController.remove);

module.exports = router;
