const { prisma } = require("../config/prisma");

const { parseRefineParams } = require("../utils/queryHelper");



const include = {
  vehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
  driver: { select: { id: true, name: true, licenseNumber: true } },
  supervisor: { select: { id: true, name: true, employeeId: true } },
};

const list = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, ["loadNumber", "origin", "destination", "material"]);

    const [loads, total] = await Promise.all([
      prisma.load.findMany({ ...params, include }),
      prisma.load.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(loads);
  } catch (error) {
    console.error("List loads error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOne = async (req, res) => {
  try {
    const load = await prisma.load.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        ...include,
        history: { orderBy: { changedAt: "desc" } },
      },
    });

    if (!load) return res.status(404).json({ message: "Load not found" });
    res.json(load);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const {
      loadNumber, vehicleId, driverId, supervisorId,
      origin, destination, material, quantity, unit,
      status, scheduledAt, notes,
    } = req.body;

    const load = await prisma.load.create({
      data: {
        loadNumber,
        vehicleId: vehicleId ? parseInt(vehicleId) : null,
        driverId: driverId ? parseInt(driverId) : null,
        supervisorId: supervisorId ? parseInt(supervisorId) : null,
        origin,
        destination,
        material,
        quantity: quantity ? parseFloat(quantity) : null,
        unit,
        status: status || "PENDING",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        notes,
      },
      include,
    });

    // Record initial status in history
    await prisma.loadHistory.create({
      data: { loadId: load.id, status: load.status, note: "Load created" },
    });

    res.status(201).json(load);
  } catch (error) {
    console.error("Create load error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A load with this load number already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const {
      loadNumber, vehicleId, driverId, supervisorId,
      origin, destination, material, quantity, unit,
      status, scheduledAt, startedAt, deliveredAt, notes,
    } = req.body;
    const id = parseInt(req.params.id);

    const existing = await prisma.load.findUnique({ where: { id } });

    const data = {};
    if (loadNumber !== undefined) data.loadNumber = loadNumber;
    if (vehicleId !== undefined) data.vehicleId = parseInt(vehicleId);
    if (driverId !== undefined) data.driverId = parseInt(driverId);
    if (supervisorId !== undefined) data.supervisorId = supervisorId ? parseInt(supervisorId) : null;
    if (origin !== undefined) data.origin = origin;
    if (destination !== undefined) data.destination = destination;
    if (material !== undefined) data.material = material;
    if (quantity !== undefined) data.quantity = quantity ? parseFloat(quantity) : null;
    if (unit !== undefined) data.unit = unit;
    if (status !== undefined) data.status = status;
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (startedAt !== undefined) data.startedAt = startedAt ? new Date(startedAt) : null;
    if (deliveredAt !== undefined) data.deliveredAt = deliveredAt ? new Date(deliveredAt) : null;
    if (notes !== undefined) data.notes = notes;

    const load = await prisma.load.update({ where: { id }, data, include });

    // Log status change to history
    if (status && existing && status !== existing.status) {
      await prisma.loadHistory.create({
        data: { loadId: id, status, note: `Status changed to ${status}` },
      });
    }

    res.json(load);
  } catch (error) {
    console.error("Update load error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A load with this load number already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.load.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Load deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Load history sub-resource
const listHistory = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, []);

    const [history, total] = await Promise.all([
      prisma.loadHistory.findMany({
        ...params,
        include: { load: { select: { id: true, loadNumber: true, origin: true, destination: true } } },
      }),
      prisma.loadHistory.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(history);
  } catch (error) {
    console.error("List load history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOneHistory = async (req, res) => {
  try {
    const item = await prisma.loadHistory.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { load: { include } },
    });

    if (!item) return res.status(404).json({ message: "History record not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { list, getOne, create, update, remove, listHistory, getOneHistory };
