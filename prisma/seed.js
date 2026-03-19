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

  console.log("✅ Seed data created successfully!");
  console.log("   - 3 Users (admin, editor, viewer)");
  console.log("   - 4 Categories");
  console.log("   - 5 Tags");
  console.log("   - 4 Sample Posts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
})
  .finally(async () => {
    await prisma.$disconnect();
  });
