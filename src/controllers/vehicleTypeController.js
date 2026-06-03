const { PrismaClient } = require("@prisma/client");
const { parseRefineParams } = require("../utils/queryHelper");

const prisma = new PrismaClient();

const list = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, ["name"]);

    const [vehicleTypes, total] = await Promise.all([
      prisma.vehicleType.findMany({ ...params }),
      prisma.vehicleType.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(vehicleTypes);
  } catch (error) {
    console.error("List vehicle types error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOne = async (req, res) => {
  try {
    const vehicleType = await prisma.vehicleType.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { vehicles: { select: { id: true, registrationNumber: true, make: true, model: true } } },
    });

    if (!vehicleType) return res.status(404).json({ message: "Vehicle type not found" });
    res.json(vehicleType);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, capacity, unit } = req.body;

    const vehicleType = await prisma.vehicleType.create({
      data: { name, description, capacity: capacity ? parseFloat(capacity) : null, unit },
    });

    res.status(201).json(vehicleType);
  } catch (error) {
    console.error("Create vehicle type error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A vehicle type with this name already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { name, description, capacity, unit } = req.body;
    const id = parseInt(req.params.id);

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (capacity !== undefined) data.capacity = capacity ? parseFloat(capacity) : null;
    if (unit !== undefined) data.unit = unit;

    const vehicleType = await prisma.vehicleType.update({ where: { id }, data });
    res.json(vehicleType);
  } catch (error) {
    console.error("Update vehicle type error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A vehicle type with this name already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.vehicleType.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Vehicle type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { list, getOne, create, update, remove };
