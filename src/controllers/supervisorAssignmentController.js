const { prisma } = require("../config/prisma");

const { parseRefineParams } = require("../utils/queryHelper");



const include = {
  supervisor: { select: { id: true, name: true, employeeId: true } },
  driver: { select: { id: true, name: true, licenseNumber: true } },
  vehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
};

const list = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, []);

    const [assignments, total] = await Promise.all([
      prisma.supervisorAssignment.findMany({ ...params, include }),
      prisma.supervisorAssignment.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(assignments);
  } catch (error) {
    console.error("List assignments error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOne = async (req, res) => {
  try {
    const assignment = await prisma.supervisorAssignment.findUnique({
      where: { id: parseInt(req.params.id) },
      include,
    });

    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { supervisorId, driverId, vehicleId, startDate, endDate, notes } = req.body;

    const assignment = await prisma.supervisorAssignment.create({
      data: {
        supervisorId: parseInt(supervisorId),
        driverId: parseInt(driverId),
        vehicleId: vehicleId ? parseInt(vehicleId) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes,
      },
      include,
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { supervisorId, driverId, vehicleId, startDate, endDate, notes } = req.body;
    const id = parseInt(req.params.id);

    const data = {};
    if (supervisorId !== undefined) data.supervisorId = parseInt(supervisorId);
    if (driverId !== undefined) data.driverId = parseInt(driverId);
    if (vehicleId !== undefined) data.vehicleId = vehicleId ? parseInt(vehicleId) : null;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (notes !== undefined) data.notes = notes;

    const assignment = await prisma.supervisorAssignment.update({ where: { id }, data, include });
    res.json(assignment);
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.supervisorAssignment.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { list, getOne, create, update, remove };
