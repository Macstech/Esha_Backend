const { PrismaClient } = require("@prisma/client");
const { parseRefineParams } = require("../utils/queryHelper");
const { slugify } = require("../utils/slugify");

const prisma = new PrismaClient();

const list = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, ["name", "description"]);

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        ...params,
        include: { _count: { select: { posts: true } } },
      }),
      prisma.category.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(categories);
  } catch (error) {
    console.error("List categories error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOne = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { _count: { select: { posts: true } } },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        description,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { name, description } = req.body;
    const data = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = slugify(name);
    }
    if (description !== undefined) data.description = description;

    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data,
    });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { list, getOne, create, update, remove };
