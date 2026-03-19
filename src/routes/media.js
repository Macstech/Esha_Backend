const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const { authenticate, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", authenticate, mediaController.list);
router.get("/:id", authenticate, mediaController.getOne);
router.post("/", authenticate, authorize("SUPER_ADMIN", "EDITOR"), upload.single("file"), mediaController.upload);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), mediaController.remove);

module.exports = router;
