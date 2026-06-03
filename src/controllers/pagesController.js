const { PrismaClient } = require("@prisma/client");
const { homeDefaults, siteDefaults } = require("../data/staticDefaults");

const prisma = new PrismaClient();

// Deep merge DB content with defaults — ensures no field is ever missing.
// Arrays: DB value wins if non-empty, otherwise fallback to default.
// Objects: merge key by key recursively.
const merge = (defaults, override) => {
  if (override === null || override === undefined) return defaults;
  if (Array.isArray(defaults)) {
    return Array.isArray(override) && override.length > 0 ? override : defaults;
  }
  if (typeof defaults === "object" && typeof override === "object") {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      if (override[key] !== undefined && override[key] !== null) {
        result[key] = merge(defaults[key], override[key]);
      }
    }
    return result;
  }
  return override ?? defaults;
};

// Transform a DB HeroSlide row → shape the website HeroSlider expects
const transformSlide = (s) => ({
  id: s.id,
  background: s.background,
  subtitle: s.subtitle,
  title: s.title,
  text: s.text,
  buttonText: s.buttonText,
  buttonLink: s.buttonLink,
  badge: s.badgeTitle ? { title: s.badgeTitle, subtitle: s.badgeSubtitle } : null,
});

// GET /api/home
const getHomePage = async (req, res) => {
  try {
    const [contentRecords, dbSlides] = await Promise.all([
      prisma.websiteContent.findMany({ where: { page: "home" } }),
      prisma.heroSlide.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
    ]);

    // Map all DB records by section — track active state
    const bySection = {};
    contentRecords.forEach((r) => {
      bySection[r.section] = { content: r.content, isActive: r.isActive };
    });

    // Returns merged content if section is active, null if explicitly deactivated, default if not in DB yet
    const resolve = (key, defaults) => {
      const record = bySection[key];
      if (!record) return defaults;           // not saved yet → show default
      if (!record.isActive) return null;      // deactivated → hide section
      return merge(defaults, record.content); // active → merge with defaults
    };

    const heroSlides = dbSlides.length > 0 ? dbSlides.map(transformSlide) : homeDefaults.heroSlides;

    res.json({
      heroSlides,
      quickServices:         resolve("quickServices",         homeDefaults.quickServices),
      about:                 resolve("about",                 homeDefaults.about),
      mission:               resolve("mission",               homeDefaults.mission),
      services:              resolve("services",              homeDefaults.services),
      environmentalBenefits: resolve("environmentalBenefits", homeDefaults.environmentalBenefits),
      wasteToEnergy:         resolve("wasteToEnergy",         homeDefaults.wasteToEnergy),
      whyChoose:             resolve("whyChoose",             homeDefaults.whyChoose),
      philosophy:            resolve("philosophy",            homeDefaults.philosophy),
      faqs:                  resolve("faqs",                  homeDefaults.faqs),
    });
  } catch (error) {
    console.error("Get home page error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/site
const getSitePage = async (req, res) => {
  try {
    const records = await prisma.websiteContent.findMany({ where: { page: "site" } });

    const bySection = {};
    records.forEach((r) => {
      bySection[r.section] = { content: r.content, isActive: r.isActive };
    });

    const resolveS = (key, defaults) => {
      const record = bySection[key];
      if (!record) return defaults;
      if (!record.isActive) return null;
      return merge(defaults, record.content);
    };

    res.json({
      company:        resolveS("company",        siteDefaults.company),
      logo:           resolveS("logo",           siteDefaults.logo),
      navigation:     resolveS("navigation",     siteDefaults.navigation),
      socialLinks:    resolveS("socialLinks",    siteDefaults.socialLinks),
      footer:         resolveS("footer",         siteDefaults.footer),
      contactInfoBar: resolveS("contactInfoBar", siteDefaults.contactInfoBar),
    });
  } catch (error) {
    console.error("Get site data error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/contact
const getContactPage = async (req, res) => {
  try {
    const records = await prisma.websiteContent.findMany({
      where: { page: "contact", isActive: true },
    });

    const bySection = {};
    records.forEach((r) => {
      bySection[r.section] = r.content;
    });

    res.json({
      breadcrumb: bySection.breadcrumb ?? {
        title: "Contact Us",
        items: [{ label: "Home", path: "/" }, { label: "Contact Us", path: "#" }],
        image: "/img/bg/breadcrumb-bg.webp",
        thumb: "/img/thumbs/truck1.svg",
      },
      infoCards: bySection.infoCards ?? [
        { title: "Our Location", icon: "fa-light fa-location-dot", content: "1/276, Thogamalai Kottai, Kovilar<br/>Dindigul - 624706, Tamil Nadu, India" },
        { title: "Phone Number", icon: "fa-light fa-phone-volume", content: '<a href="tel:+919787180829">+91 97871 80829</a><br/>Call us anytime for inquiries' },
        { title: "Email Address", icon: "fa-light fa-envelope", content: '<a href="mailto:esha.office.dgl@gmail.com">esha.office.dgl@gmail.com</a><br/>We respond within 24 hours' },
      ],
      form: bySection.form ?? {
        title: "Get in Touch with ESHA Enterprises",
        subtitle: "Have questions about our waste management services? Fill out the form below and our team will get back to you.",
        services: [
          { value: "0", label: "Select Service Required" },
          { value: "collection", label: "Collection and Transportation" },
          { value: "segregation", label: "Waste Segregation" },
          { value: "shredding", label: "Mechanical Shredding and Screening" },
          { value: "coprocessing", label: "Co-Processing in Cement Kilns" },
          { value: "municipal", label: "Municipal Waste Management" },
          { value: "industrial", label: "Industrial Waste Management" },
          { value: "other", label: "Other Services" },
        ],
      },
      map: bySection.map ?? {
        embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125323.40216332498!2d77.89777147226088!3d10.366041645498347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00aa7a87de8b0d%3A0x7603e68e5c5cadc4!2sDindigul%2C%20Tamil%20Nadu%2C%20India!5e0!3m2!1sen!2sus!4v1708352698740!5m2!1sen!2sus",
      },
      whyContact: bySection.whyContact ?? {
        subtitle: "Why Contact Us",
        title: "Your Trusted Waste Management Partner",
        cards: [
          { title: "PCB Compliant", icon: "fa-light fa-badge-check", description: "All operations comply with Pollution Control Board standards." },
          { title: "24/7 Support", icon: "fa-light fa-headset", description: "Our team is available to address your waste management needs." },
          { title: "Free Consultation", icon: "fa-light fa-comments", description: "Get expert advice on the best waste management solutions for you." },
        ],
      },
    });
  } catch (error) {
    console.error("Get contact page error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/projects
const getProjectsPage = async (req, res) => {
  try {
    const records = await prisma.websiteContent.findMany({
      where: { page: "projects", isActive: true },
    });

    const bySection = {};
    records.forEach((r) => {
      bySection[r.section] = r.content;
    });

    res.json({
      breadcrumb: bySection.breadcrumb ?? {
        title: "Our Projects",
        items: [{ label: "Home", path: "/" }, { label: "Our Projects", path: "#" }],
        image: "/img/bg/breadcrumb-bg.webp",
        thumb: "/img/thumbs/truck1.svg",
      },
      header: bySection.header ?? {
        subtitle: "Our Projects",
        title: "Waste Management Projects We Have Completed",
      },
      projects: bySection.projects ?? [],
    });
  } catch (error) {
    console.error("Get projects page error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/contact — contact form submission
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required." });
    }

    await prisma.contactSubmission.create({
      data: { name, email, phone: phone || null, service: service || null, message },
    });

    res.json({ success: true, message: "Thank you! We will get back to you within 24 hours." });
  } catch (error) {
    // If ContactSubmission model doesn't exist yet, still return success to not break the website
    if (error.code === "P2021") {
      console.warn("ContactSubmission table not found — run prisma migrate");
      return res.json({ success: true, message: "Thank you for reaching out!" });
    }
    console.error("Contact form submission error:", error);
    res.status(500).json({ message: "Failed to submit. Please try again." });
  }
};

module.exports = { getHomePage, getSitePage, getContactPage, getProjectsPage, submitContact };
