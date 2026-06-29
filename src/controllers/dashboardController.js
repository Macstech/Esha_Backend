const { prisma } = require("../config/prisma");




const getStats = async (req, res) => {
  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalMedia,
      totalUsers,
      recentPosts,
      topAuthors,
      postsByMonth,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.category.count(),
      prisma.media.count(),
      prisma.user.count(),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { name: true } },
          categories: { select: { name: true } },
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          _count: { select: { posts: true } },
        },
        orderBy: { posts: { _count: "desc" } },
        take: 5,
      }),
      // Posts by month (last 6 months)
      prisma.$queryRaw`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
          COUNT(*)::int as count
        FROM "Post"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,
    ]);

    res.json({
      totals: {
        posts: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
        categories: totalCategories,
        media: totalMedia,
        users: totalUsers,
      },
      recentPosts,
      topAuthors,
      postsByMonth,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getStats };
