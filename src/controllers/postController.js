const { prisma } = require("../config/prisma");

const { parseRefineParams } = require("../utils/queryHelper");
const { slugify } = require("../utils/slugify");



const list = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, ["title", "content"]);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        ...params,
        include: {
          author: { select: { id: true, name: true, email: true } },
          categories: true,
          tags: true,
        },
      }),
      prisma.post.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(posts);
  } catch (error) {
    console.error("List posts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOne = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
        tags: true,
        media: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { title, content, excerpt, status, coverImage, categoryIds, tagIds } = req.body;

    const slug = slugify(title);

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        status: status || "DRAFT",
        coverImage,
        authorId: req.user.id,
        categories: categoryIds
          ? { connect: categoryIds.map((id) => ({ id: parseInt(id) })) }
          : undefined,
        tags: tagIds
          ? { connect: tagIds.map((id) => ({ id: parseInt(id) })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
        tags: true,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A post with this title already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { title, content, excerpt, status, coverImage, categoryIds, tagIds } = req.body;
    const id = parseInt(req.params.id);

    const data = {};
    if (title !== undefined) {
      data.title = title;
      data.slug = slugify(title);
    }
    if (content !== undefined) data.content = content;
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (status !== undefined) data.status = status;
    if (coverImage !== undefined) data.coverImage = coverImage;

    if (categoryIds !== undefined) {
      data.categories = {
        set: [],
        connect: categoryIds.map((cid) => ({ id: parseInt(cid) })),
      };
    }
    if (tagIds !== undefined) {
      data.tags = {
        set: [],
        connect: tagIds.map((tid) => ({ id: parseInt(tid) })),
      };
    }

    const post = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
        tags: true,
      },
    });

    res.json(post);
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.post.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { list, getOne, create, update, remove };
