const express = require("express");
const router = express.Router();
const c = require("../controllers/websiteContentController");
const { authenticate, authorize } = require("../middleware/auth");

// ── WebsiteContent ──────────────────────────────────────
// Public read (website frontend can fetch without auth)
router.get("/content", c.listContent);
router.get("/content/by-section", c.getBySectionContent);
router.get("/content/:id", c.getOneContent);

// Write operations require authentication
router.post("/content", authenticate, authorize("SUPER_ADMIN", "EDITOR"), c.createContent);
router.put("/content/upsert", authenticate, authorize("SUPER_ADMIN", "EDITOR"), c.upsertContent);
router.patch("/content/:id", authenticate, authorize("SUPER_ADMIN", "EDITOR"), c.updateContent);
router.delete("/content/:id", authenticate, authorize("SUPER_ADMIN"), c.removeContent);

// ── HeroSlides ──────────────────────────────────────────
// Public read
router.get("/slides", c.listSlides);
router.get("/slides/:id", c.getOneSlide);

// Write operations require authentication
router.post("/slides", authenticate, authorize("SUPER_ADMIN", "EDITOR"), c.createSlide);
router.patch("/slides/:id", authenticate, authorize("SUPER_ADMIN", "EDITOR"), c.updateSlide);
router.delete("/slides/:id", authenticate, authorize("SUPER_ADMIN"), c.removeSlide);

module.exports = router;
