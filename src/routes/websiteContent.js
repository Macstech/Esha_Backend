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
router.post("/content", authenticate, authorize("ADMIN"), c.createContent);
router.put("/content/upsert", authenticate, authorize("ADMIN"), c.upsertContent);
router.patch("/content/:id", authenticate, authorize("ADMIN"), c.updateContent);
router.delete("/content/:id", authenticate, authorize("ADMIN"), c.removeContent);

// ── HeroSlides ──────────────────────────────────────────
// Public read
router.get("/slides", c.listSlides);
router.get("/slides/:id", c.getOneSlide);

// Write operations require authentication
router.post("/slides", authenticate, authorize("ADMIN"), c.createSlide);
router.patch("/slides/:id", authenticate, authorize("ADMIN"), c.updateSlide);
router.delete("/slides/:id", authenticate, authorize("ADMIN"), c.removeSlide);

module.exports = router;
