const { PrismaClient } = require("@prisma/client");
const { parseRefineParams } = require("../utils/queryHelper");

const prisma = new PrismaClient();

const list = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, ["name", "employeeId", "zone"]);

    const [supervisors, total] = await Promise.all([
      prisma.supervisor.findMany({
        ...params,
        include: {
          assignments: {
            include: {
              driver: { select: { id: true, name: true } },
              vehicle: { select: { id: true, registrationNumber: true } },
            },
          },
        },
      }),
      prisma.supervisor.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(supervisors);
  } catch (error) {
    console.error("List supervisors error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOne = async (req, res) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        assignments: {
          include: {
            driver: { select: { id: true, name: true, licenseNumber: true } },
            vehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
          },
        },
      },
    });

    if (!supervisor) return res.status(404).json({ message: "Supervisor not found" });
    res.json(supervisor);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { name, employeeId, phone, email, zone, isActive } = req.body;

    const supervisor = await prisma.supervisor.create({
      data: { name, employeeId, phone, email, zone, isActive: isActive ?? true },
    });

    res.status(201).json(supervisor);
  } catch (error) {
    console.error("Create supervisor error:", error);
    if (error.code === "P2002") {
      const field = error.meta?.target?.includes("email") ? "email" : "employee ID";
      return res.status(400).json({ message: `A supervisor with this ${field} already exists` });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { name, employeeId, phone, email, zone, isActive } = req.body;
    const id = parseInt(req.params.id);

    const data = {};
    if (name !== undefined) data.name = name;
    if (employeeId !== undefined) data.employeeId = employeeId;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (zone !== undefined) data.zone = zone;
    if (isActive !== undefined) data.isActive = isActive;

    const supervisor = await prisma.supervisor.update({ where: { id }, data });
    res.json(supervisor);
  } catch (error) {
    console.error("Update supervisor error:", error);
    if (error.code === "P2002") {
      const field = error.meta?.target?.includes("email") ? "email" : "employee ID";
      return res.status(400).json({ message: `A supervisor with this ${field} already exists` });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.supervisor.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Supervisor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { list, getOne, create, update, remove };
