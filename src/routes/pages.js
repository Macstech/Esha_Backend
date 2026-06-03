const express = require("express");
const router = express.Router();
const { getHomePage, getSitePage, getContactPage, getProjectsPage, submitContact } = require("../controllers/pagesController");

// Public page-aggregate endpoints — consumed by the website frontend
router.get("/home", getHomePage);
router.get("/site", getSitePage);
router.get("/contact", getContactPage);
router.post("/contact", submitContact);
router.get("/projects", getProjectsPage);

module.exports = router;
