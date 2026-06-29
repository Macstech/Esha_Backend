const { prisma } = require("../config/prisma");




const summary = async (req, res) => {
  try {
    const [
      totalLoads,
      loadsByStatus,
      totalDrivers,
      totalVehicles,
      totalSupervisors,
      recentLoads,
    ] = await Promise.all([
      prisma.load.count(),
      prisma.load.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.driver.count(),
      prisma.vehicle.count(),
      prisma.supervisor.count({ where: { isActive: true } }),
      prisma.load.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: { select: { registrationNumber: true } },
          driver: { select: { name: true } },
        },
      }),
    ]);

    res.json({
      totalLoads,
      loadsByStatus: loadsByStatus.map((s) => ({ status: s.status, count: s._count.id })),
      totalDrivers,
      totalVehicles,
      totalSupervisors,
      recentLoads,
    });
  } catch (error) {
    console.error("Summary report error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const driversReport = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        vehicles: { include: { vehicle: { select: { registrationNumber: true } } } },
        loads: { select: { id: true, status: true, loadNumber: true, createdAt: true } },
        _count: { select: { loads: true } },
      },
      orderBy: { name: "asc" },
    });

    res.setHeader("x-total-count", drivers.length);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(drivers);
  } catch (error) {
    console.error("Drivers report error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const vehiclesReport = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        vehicleType: { select: { name: true } },
        drivers: { include: { driver: { select: { name: true } } } },
        loads: { select: { id: true, status: true, loadNumber: true, createdAt: true } },
        _count: { select: { loads: true } },
      },
      orderBy: { registrationNumber: "asc" },
    });

    res.setHeader("x-total-count", vehicles.length);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(vehicles);
  } catch (error) {
    console.error("Vehicles report error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loadsReport = async (req, res) => {
  try {
    const { status, from, to } = req.query;

    const where = {};
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [loads, total] = await Promise.all([
      prisma.load.findMany({
        where,
        include: {
          vehicle: { select: { registrationNumber: true } },
          driver: { select: { name: true } },
          supervisor: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.load.count({ where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(loads);
  } catch (error) {
    console.error("Loads report error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { summary, driversReport, vehiclesReport, loadsReport };
