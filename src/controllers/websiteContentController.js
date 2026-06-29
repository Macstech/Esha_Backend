const { prisma } = require("../config/prisma");

const { parseRefineParams } = require("../utils/queryHelper");



// ──────────────────────────────────────────────
// WebsiteContent (one record per page+section)
// ──────────────────────────────────────────────

const listContent = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, ["page", "section"]);

    const [records, total] = await Promise.all([
      prisma.websiteContent.findMany({
        ...params,
        include: { editor: { select: { id: true, name: true, email: true } } },
      }),
      prisma.websiteContent.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(records);
  } catch (error) {
    console.error("List website content error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOneContent = async (req, res) => {
  try {
    const record = await prisma.websiteContent.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { editor: { select: { id: true, name: true, email: true } } },
    });

    if (!record) return res.status(404).json({ message: "Content not found" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/website-content/by-section?page=home&section=about
const getBySectionContent = async (req, res) => {
  try {
    const { page, section } = req.query;
    if (!page || !section) {
      return res.status(400).json({ message: "page and section query params are required" });
    }

    // Using the unique constraint on (page, section) for efficient lookup and active content retrieval
    const record = await prisma.websiteContent.findUnique({
      where: { page_section: { page, section, isActive: true } },
    });

    if (!record) return res.status(404).json({ message: "Content not found" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const createContent = async (req, res) => {
  try {
    const { page, section, content, isActive } = req.body;

    const record = await prisma.websiteContent.create({
      data: {
        page,
        section,
        content,
        isActive: isActive ?? true,
        updatedBy: req.user?.id ?? null,
      },
    });

    res.status(201).json(record);
  } catch (error) {
    console.error("Create website content error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Content for this page+section already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateContent = async (req, res) => {
  try {
    const { page, section, content, isActive } = req.body;
    const id = parseInt(req.params.id);

    const data = { updatedBy: req.user?.id ?? null };
    if (page !== undefined) data.page = page;
    if (section !== undefined) data.section = section;
    if (content !== undefined) data.content = content;
    if (isActive !== undefined) data.isActive = isActive;

    const record = await prisma.websiteContent.update({ where: { id }, data });
    res.json(record);
  } catch (error) {
    console.error("Update website content error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Content for this page+section already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Upsert by page+section — handy for the website frontend to seed defaults
const upsertContent = async (req, res) => {
  try {
    const { page, section, content, isActive } = req.body;
    if (!page || !section) {
      return res.status(400).json({ message: "page and section are required" });
    }

    const record = await prisma.websiteContent.upsert({
      where: { page_section: { page, section } },
      update: { content, isActive: isActive ?? true, updatedBy: req.user?.id ?? null },
      create: { page, section, content, isActive: isActive ?? true, updatedBy: req.user?.id ?? null },
    });

    res.json(record);
  } catch (error) {
    console.error("Upsert website content error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeContent = async (req, res) => {
  try {
    await prisma.websiteContent.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ──────────────────────────────────────────────
// HeroSlide
// ──────────────────────────────────────────────

const listSlides = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, ["subtitle", "title"]);

    const [slides, total] = await Promise.all([
      prisma.heroSlide.findMany({ ...params }),
      prisma.heroSlide.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(slides);
  } catch (error) {
    console.error("List hero slides error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOneSlide = async (req, res) => {
  try {
    const slide = await prisma.heroSlide.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!slide) return res.status(404).json({ message: "Slide not found" });
    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const createSlide = async (req, res) => {
  try {
    const { background, subtitle, title, text, buttonText, buttonLink, badgeTitle, badgeSubtitle, order, isActive } =
      req.body;

    const slide = await prisma.heroSlide.create({
      data: {
        background,
        subtitle,
        title,
        text,
        buttonText,
        buttonLink,
        badgeTitle: badgeTitle ?? null,
        badgeSubtitle: badgeSubtitle ?? null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json(slide);
  } catch (error) {
    console.error("Create hero slide error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateSlide = async (req, res) => {
  try {
    const { background, subtitle, title, text, buttonText, buttonLink, badgeTitle, badgeSubtitle, order, isActive } =
      req.body;
    const id = parseInt(req.params.id);

    const data = {};
    if (background !== undefined) data.background = background;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (title !== undefined) data.title = title;
    if (text !== undefined) data.text = text;
    if (buttonText !== undefined) data.buttonText = buttonText;
    if (buttonLink !== undefined) data.buttonLink = buttonLink;
    if (badgeTitle !== undefined) data.badgeTitle = badgeTitle;
    if (badgeSubtitle !== undefined) data.badgeSubtitle = badgeSubtitle;
    if (order !== undefined) data.order = order;
    if (isActive !== undefined) data.isActive = isActive;

    const slide = await prisma.heroSlide.update({ where: { id }, data });
    res.json(slide);
  } catch (error) {
    console.error("Update hero slide error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeSlide = async (req, res) => {
  try {
    await prisma.heroSlide.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  listContent,
  getOneContent,
  getBySectionContent,
  createContent,
  updateContent,
  upsertContent,
  removeContent,
  listSlides,
  getOneSlide,
  createSlide,
  updateSlide,
  removeSlide,
};
