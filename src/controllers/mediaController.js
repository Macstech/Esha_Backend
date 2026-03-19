const { PrismaClient } = require("@prisma/client");
const { parseRefineParams } = require("../utils/queryHelper");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

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

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

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
    const url = `/uploads/${file.filename}`;

    const media = await prisma.media.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        url,
        mimeType: file.mimetype,
        size: file.size,
        postId: req.body.postId ? parseInt(req.body.postId) : null,
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

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.media.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { list, getOne, upload, remove };
