const { prisma } = require("../config/prisma");
const { parseRefineParams } = require("../utils/queryHelper");
const fs = require("fs");
const path = require("path");

const list = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, ["filename", "originalName"]);

    const [media, total] = await Promise.all([
      prisma.media.findMany(params),
      prisma.media.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(media);
  } catch (error) {
    console.error("List media error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOne = async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!media) return res.status(404).json({ message: "Media not found" });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { file } = req;

    // Cloudinary returns path/secure_url; disk returns filename
    const url = file.path || `/uploads/${file.filename}`;
    const filename = file.filename || file.originalname;

    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.originalname,
        url,
        mimeType: file.mimetype,
        size: file.size,
        postId: req.body.postId ? parseInt(req.body.postId) : null,
        // Optional: link document to a specific load
        loadId: req.body.loadId ? parseInt(req.body.loadId) : null,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!media) return res.status(404).json({ message: "Media not found" });

    // Only delete local files (Cloudinary manages its own storage)
    if (media.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), media.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.media.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { list, getOne, upload, remove };
