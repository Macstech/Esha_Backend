const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("../config");

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// ── Cloudinary storage (used when env vars are present) ─────────────────────
let upload;

const cloudCfg = config.cloudinary;
const hasCloudinary = cloudCfg.cloudName && cloudCfg.apiKey && cloudCfg.apiSecret;

if (hasCloudinary) {
  const cloudinary = require("cloudinary").v2;
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  cloudinary.config({
    cloud_name: cloudCfg.cloudName,
    api_key:    cloudCfg.apiKey,
    api_secret: cloudCfg.apiSecret,
  });

  const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: "esha-uploads",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf", "mp4", "webm", "doc", "docx"],
      // Resize images on-the-fly; leave other types untransformed
      transformation: file.mimetype.startsWith("image/")
        ? [{ width: 1600, crop: "limit" }]
        : undefined,
    }),
  });

  upload = multer({ storage: cloudStorage, fileFilter, limits: { fileSize: config.maxFileSize } });
  console.log("[upload] Using Cloudinary storage");

} else {
  // ── Local disk storage (dev / fallback) ─────────────────────────────────
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.uploadDir),
    filename: (req, file, cb) => {
      const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, suffix + path.extname(file.originalname));
    },
  });

  upload = multer({ storage: diskStorage, fileFilter, limits: { fileSize: config.maxFileSize } });
  if (process.env.NODE_ENV === "production") {
    console.warn("[upload] WARNING: using local disk storage in production. Set CLOUDINARY_* env vars.");
  }
}

module.exports = upload;
