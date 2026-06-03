const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const editorPassword = await bcrypt.hash("editor123", 10);
  const viewerPassword = await bcrypt.hash("viewer123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@contenthub.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@contenthub.com",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@contenthub.com" },
    update: {},
    create: {
      name: "Editor User",
      email: "editor@contenthub.com",
      password: editorPassword,
      role: "EDITOR",
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@contenthub.com" },
    update: {},
    create: {
      name: "Viewer User",
      email: "viewer@contenthub.com",
      password: viewerPassword,
      role: "VIEWER",
    },
  });

  // Create categories
  const categories = await Promise.all(
    [
      { name: "Technology", slug: "technology", description: "Tech news and tutorials" },
      { name: "Design", slug: "design", description: "UI/UX and graphic design" },
      { name: "Business", slug: "business", description: "Business and entrepreneurship" },
      { name: "Lifestyle", slug: "lifestyle", description: "Lifestyle and wellness" },
    ].map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );

  // Create tags
  const tags = await Promise.all(
    [
      { name: "React", slug: "react" },
      { name: "Node.js", slug: "nodejs" },
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "Tutorial", slug: "tutorial" },
      { name: "News", slug: "news" },
    ].map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      })
    )
  );

  // Create sample posts
  const posts = [
    {
      title: "Getting Started with Refine",
      slug: "getting-started-with-refine",
      content: "<p>Refine is a powerful React framework for building data-intensive applications. In this guide, we'll walk through setting up your first Refine project with Ant Design and a REST API backend.</p><p>Refine provides out-of-the-box support for routing, authentication, access control, and data fetching — making it ideal for admin panels and CMS portals.</p>",
      excerpt: "Learn how to set up your first Refine project with Ant Design.",
      status: "PUBLISHED",
      authorId: admin.id,
      categories: { connect: [{ id: categories[0].id }] },
      tags: { connect: [{ id: tags[0].id }, { id: tags[3].id }] },
      viewCount: 245,
    },
    {
      title: "Building REST APIs with Express and Prisma",
      slug: "building-rest-apis-express-prisma",
      content: "<p>Express.js combined with Prisma ORM provides a fast and type-safe way to build REST APIs. This tutorial covers setting up models, controllers, and routes.</p><p>We'll also look at pagination, filtering, and sorting — essential features for any admin panel.</p>",
      excerpt: "A complete guide to building REST APIs with Express and Prisma.",
      status: "PUBLISHED",
      authorId: editor.id,
      categories: { connect: [{ id: categories[0].id }] },
      tags: { connect: [{ id: tags[1].id }, { id: tags[2].id }] },
      viewCount: 189,
    },
    {
      title: "Design Systems for Admin Panels",
      slug: "design-systems-admin-panels",
      content: "<p>A well-structured design system can dramatically speed up the development of admin interfaces. Learn how to leverage Ant Design's component library effectively.</p>",
      excerpt: "How to build effective design systems for admin UIs.",
      status: "DRAFT",
      authorId: editor.id,
      categories: { connect: [{ id: categories[1].id }] },
      tags: { connect: [{ id: tags[0].id }] },
      viewCount: 0,
    },
    {
      title: "Scaling Your CMS for Growth",
      slug: "scaling-cms-for-growth",
      content: "<p>As your content library grows, you need strategies for maintaining performance. This article covers database optimization, caching, and CDN strategies.</p>",
      excerpt: "Strategies for scaling your CMS as content grows.",
      status: "PUBLISHED",
      authorId: admin.id,
      categories: { connect: [{ id: categories[2].id }] },
      tags: { connect: [{ id: tags[4].id }] },
      viewCount: 312,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  // ── Website Content ──────────────────────────────────────
  const websiteSections = [
    {
      page: "site",
      section: "company",
      content: {
        name: "ESHA Enterprises",
        tagline: "Go Green. Plastic-Free Tamil Nadu.",
        description:
          "ESHA Enterprises is committed to creating sustainable waste management solutions that protect our environment and support a plastic-free future for Tamil Nadu.",
        phone: "+91 97871 80829",
        phoneRaw: "+919787180829",
        email: "esha.office.dgl@gmail.com",
        address: {
          line1: "1/276, Thogamalai Kottai, Kovilar",
          line2: "Dindigul - 624706",
          line3: "Tamil Nadu, India",
          short: "Dindigul - 624706, Tamil Nadu",
        },
        hours: "Mon-Sat: 9:00am to 6:00pm",
        copyright: "2026 ESHA Enterprises. All Rights Reserved. | Go Green. Plastic-Free Tamil Nadu.",
      },
    },
    {
      page: "site",
      section: "socialLinks",
      content: [
        { icon: "fab fa-facebook-f", url: "https://facebook.com/" },
        { icon: "fab fa-x-twitter", url: "https://twitter.com/" },
        { icon: "fab fa-instagram", url: "https://www.instagram.com/" },
        { icon: "fab fa-linkedin-in", url: "https://linkedin.com/" },
      ],
    },
    {
      page: "home",
      section: "quickServices",
      content: [
        {
          title: "PCB Compliant",
          icon: "fa-light fa-badge-check",
          description: "Pollution Control Board certified operations ensuring regulatory compliance.",
        },
        {
          title: "Waste to Energy",
          icon: "fa-light fa-bolt",
          description: "Converting non-recyclable waste into Refuse Derived Fuel (RDF) for industrial use.",
        },
        {
          title: "Eco-Friendly",
          icon: "fa-light fa-leaf",
          description: "Sustainable processes that protect the environment and support a plastic-free future.",
        },
      ],
    },
    {
      page: "home",
      section: "about",
      content: {
        subtitle: "About Us",
        title: "ESHA Enterprises",
        heading: "Your Trusted Waste Management Partner",
        paragraphs: [
          "ESHA Enterprises has extensive expertise managing municipal waste, including RDF, non-recyclable plastic waste, and environmentally safe disposal into the cement industry. We provide comprehensive, end-to-end waste disposal management solutions, including collection, loading, transportation, preprocessing, and environmentally safe disposal according to the Pollution Control Board.",
          "We strive to enhance sustainability in every aspect of our activities like segregated combustible Municipality waste collection, transportation and safely handover to Cement Industries for Eco Friendly disposal that complies with environmental standards prescribed by CPCB and SPCB.",
        ],
        image: "/img/thumbs/truck.svg",
        achievements: [
          { icon: "fa-light fa-badge-check", value: "PCB", label: "Pollution Control Board" },
          { icon: "fa-light fa-shield-check", value: "CPCB", label: "Central Pollution Control" },
          { icon: "fa-light fa-certificate", value: "SPCB", label: "State Pollution Control" },
          { icon: "fa-light fa-leaf", value: "100%", label: "Eco-Friendly Process", isCounter: true, counterEnd: 100 },
        ],
      },
    },
    {
      page: "home",
      section: "mission",
      content: {
        subtitle: "Our Mission",
        title: "Conserve and Sustain a Clean & Green Environment",
        description:
          "We commit to Conserve and Sustain clean and green environment by implementing an appropriate waste management system for Safe and environmentally responsible disposal of Municipal and industrial waste that are transformed into usable energy sources for the cement Industry, thereby conserving fossil fuels and sustaining a clean and green environment in and around us.",
        cards: [
          { title: "Waste Segregation", icon: "fa-light fa-filter", description: "Promote proper waste segregation and safe disposal practices." },
          { title: "Reduce Landfill", icon: "fa-light fa-trash-can-slash", description: "Reduce landfill dependency through innovative waste processing." },
          { title: "Waste to Energy", icon: "fa-light fa-bolt", description: "Support waste-to-energy initiatives for sustainable power generation." },
          { title: "Plastic-Free TN", icon: "fa-light fa-recycle", description: "Contribute to a plastic-free Tamil Nadu through responsible processing." },
          { title: "Municipal Solutions", icon: "fa-light fa-building-columns", description: "Deliver environmentally compliant solutions for municipal sectors." },
          { title: "Industrial Solutions", icon: "fa-light fa-industry", description: "Comprehensive waste management for industrial sectors." },
        ],
      },
    },
    {
      page: "home",
      section: "services",
      content: {
        subtitle: "Our Services",
        title: "Complete Waste Management Solutions",
        details: [
          {
            icon: "fa-light fa-truck-fast",
            title: "Collection & Transportation",
            items: [
              "Segregated combustible waste (MSW, RDF) collection from Municipalities & HW&OW from Industries",
              "Transportation of Segregated combustible waste from ULB & Industries to Cement Industry",
              "Unloading and shredding of waste in compliance with Cement industry standards",
              "Dedicated own vehicles used for waste transportation to provide reliable, timely, and secure collection service",
            ],
          },
          {
            icon: "fa-light fa-gears",
            title: "Pre-Processing & Co-Processing",
            items: [
              "Operation and maintenance of Mechanized preprocessing system including unloading, storage, segregation, shredding operation and screening activities",
              "Operation & Maintenance of Fully mechanized co-processing system",
              "Preprocessing and Co-processing equipment ensuring consistent quality and efficiency",
            ],
          },
        ],
      },
    },
    {
      page: "home",
      section: "environmentalBenefits",
      content: {
        subtitle: "Environmental Benefits",
        title: "Creating a Sustainable Future",
        cards: [
          {
            icon: "fa-light fa-seedling",
            title: "Safe & ECO Friendly Disposal",
            description: "Safe & ECO friendly disposal in cement kiln - Reduces landfill burden and ground contamination.",
          },
          {
            icon: "fa-light fa-fire-flame-curved",
            title: "Fossil Fuel Conservation",
            description: "Thermal energy utilization from waste resources reduces dependency on conventional fossil fuels.",
          },
          {
            icon: "fa-light fa-cloud",
            title: "Reduction of CO₂ Emission",
            description: "Lower carbon footprint through sustainable waste-to-energy conversion processes.",
          },
        ],
        banner: "Clean and Green Environment in and around us",
      },
    },
    {
      page: "home",
      section: "wasteToEnergy",
      content: {
        subtitle: "Waste to Energy",
        title: "Transforming Waste into Opportunity",
        items: [
          {
            number: "01",
            image: "/img/thumbs/thumb-90.webp",
            category: "RDF Production",
            title: "Refuse Derived Fuel for Industrial Applications",
            description:
              "Through co-processing and waste-to-energy initiatives, we convert non-recyclable waste into usable energy for industrial applications, reducing environmental impact and promoting sustainability. Our RDF is used in cement kilns, reducing dependency on conventional fuels.",
            buttonText: "Learn More",
            buttonLink: "/contact",
          },
          {
            number: "02",
            image: "/img/thumbs/thumb-91.webp",
            category: "Industrial Solutions",
            title: "Municipal & Industrial Waste Management",
            description:
              "We believe in transforming waste into opportunity. Our comprehensive solutions are tailored to government bodies, municipalities, and industries, ensuring proper disposal and maximum resource recovery while meeting all regulatory requirements.",
            buttonText: "Get Quote",
            buttonLink: "/contact",
          },
        ],
      },
    },
    {
      page: "home",
      section: "whyChoose",
      content: {
        title: "Why Choose ESHA Enterprises?",
        reasons: [
          { icon: "fa-light fa-gears", title: "Integrated Solutions", description: "We efficiently handle every stage, from collection to eco-friendly disposal." },
          { icon: "fa-light fa-leaf", title: "Environmental Commitment", description: "We work to ensure that our clean and green operations are in line with waste management regulations and sustainability goals." },
          { icon: "fa-light fa-truck-fast", title: "Reliability", description: "In order to deliver a reliable, prompt, and secure collection service, our own GPRS-enabled trucks are dedicated for waste transportation." },
          { icon: "fa-light fa-recycle", title: "Value for Waste", description: "We solve environmental problems and generate commercial possibilities by recovering maximum value from waste streams for both waste generators and disposers." },
          { icon: "fa-light fa-badge-check", title: "Statutory Compliance", description: "Our activities adhere to regulatory compliance frameworks and established quality processes." },
        ],
        progressBars: [
          { label: "Waste Processing Efficiency", value: 98 },
          { label: "Client Satisfaction", value: 100 },
        ],
      },
    },
    {
      page: "home",
      section: "philosophy",
      content: {
        subtitle: "Our Philosophy",
        quote: "Waste is not a problem — it is a resource in the wrong place.",
        tagline: "My Earth, My Responsibility.",
      },
    },
    {
      page: "home",
      section: "faqs",
      content: [
        {
          question: "What types of waste does ESHA Enterprises handle?",
          answer: "We specialize in municipal non-recyclable plastic waste, industrial plastic waste, and mixed solid waste. Our services include collection, transportation, segregation, mechanical shredding, and co-processing of waste materials that cannot be recycled through conventional methods.",
        },
        {
          question: "What is RDF (Refuse Derived Fuel)?",
          answer: "RDF is a fuel produced from various types of waste such as plastics, paper, textiles, and other combustible materials. We process non-recyclable waste into RDF, which is then used as an alternative fuel in cement kilns, replacing conventional fossil fuels and reducing environmental impact.",
        },
        {
          question: "Is ESHA Enterprises compliant with environmental regulations?",
          answer: "Yes, we are fully compliant with PCB (Pollution Control Board), CPCB (Central Pollution Control Board), and SPCB (State Pollution Control Board) regulations. All our operations follow strict environmental guidelines to ensure safe and responsible waste management practices.",
        },
        {
          question: "Which areas does ESHA Enterprises serve?",
          answer: "We primarily serve Tamil Nadu, with our headquarters in Dindigul. Our services extend to municipalities, industrial facilities, and organizations across the state. Contact us to check if we can serve your specific location.",
        },
        {
          question: "How can I get a quote for waste management services?",
          answer: "You can request a free quote by calling us at +91 97871 80829, emailing esha.office.dgl@gmail.com, or filling out the contact form on our website. Our team will assess your requirements and provide a customized solution.",
        },
        {
          question: "What is co-processing in cement kilns?",
          answer: "Co-processing is an environmentally sound method of waste management where non-recyclable waste is used as alternative fuel or raw material in cement manufacturing. The high temperatures in cement kilns (above 1400°C) ensure complete destruction of waste with minimal emissions, making it a sustainable solution for waste disposal.",
        },
      ],
    },
  ];

  for (const section of websiteSections) {
    await prisma.websiteContent.upsert({
      where: { page_section: { page: section.page, section: section.section } },
      update: { content: section.content },
      create: section,
    });
  }

  // Hero slides
  const heroSlides = [
    {
      order: 1,
      background: "/img/bg/slider3.svg",
      subtitle: "Municipal Non-Recyclable Plastic Waste Transporters",
      title: "Building a Cleaner & <span>Greener Tomorrow</span>",
      text: "At ESHA Enterprises, we are committed to creating sustainable waste management solutions that protect our environment and support a plastic-free future.",
      buttonText: "Learn More",
      buttonLink: "#about",
      badgeTitle: "PCB",
      badgeSubtitle: "Compliant",
    },
    {
      order: 2,
      background: "/img/bg/slider1.svg",
      subtitle: "Go Green. Plastic-Free Tamil Nadu.",
      title: "From Waste to Energy: <span>Sustainable Solutions</span>",
      text: "We transform non-recyclable waste into valuable energy resources through responsible and eco-friendly processes.",
      buttonText: "Our Services",
      buttonLink: "#services",
      badgeTitle: "CPCB",
      badgeSubtitle: "Standards",
    },
    {
      order: 3,
      background: "/img/bg/slider2.svg",
      subtitle: "My Earth, My Responsibility",
      title: "Waste is a Resource <span>In the Wrong Place</span>",
      text: "With strong expertise in municipal and industrial waste handling, we deliver environmentally compliant solutions.",
      buttonText: "Contact Us",
      buttonLink: "/contact",
      badgeTitle: "SPCB",
      badgeSubtitle: "Approved",
    },
  ];

  for (const slide of heroSlides) {
    const existing = await prisma.heroSlide.findFirst({ where: { order: slide.order } });
    if (!existing) {
      await prisma.heroSlide.create({ data: slide });
    }
  }

  console.log("✅ Seed data created successfully!");
  console.log("   - 3 Users (admin, editor, viewer)");
  console.log("   - 4 Categories");
  console.log("   - 5 Tags");
  console.log("   - 4 Sample Posts");
  console.log("   - 11 Website content sections");
  console.log("   - 3 Hero slides");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
})
  .finally(async () => {
    await prisma.$disconnect();
  });
