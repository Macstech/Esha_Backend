const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, postController.list);
router.get("/:id", authenticate, postController.getOne);
router.post("/", authenticate, authorize("SUPER_ADMIN", "EDITOR"), postController.create);
router.patch("/:id", authenticate, authorize("SUPER_ADMIN", "EDITOR"), postController.update);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), postController.remove);

module.exports = router;
