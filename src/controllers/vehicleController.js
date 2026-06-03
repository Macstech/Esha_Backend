const { PrismaClient } = require("@prisma/client");
const { parseRefineParams } = require("../utils/queryHelper");

const prisma = new PrismaClient();

const list = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, ["registrationNumber", "make", "model"]);

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        ...params,
        include: {
          drivers: {
            include: {
              driver: { select: { id: true, name: true, licenseNumber: true, phone: true } },
            },
          },
        },
      }),
      prisma.vehicle.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(vehicles);
  } catch (error) {
    console.error("List vehicles error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOne = async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        drivers: {
          include: {
            driver: { select: { id: true, name: true, licenseNumber: true, phone: true } },
          },
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { registrationNumber, make, model, year, image, driverIds } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber,
        make,
        model,
        year: year ? parseInt(year) : null,
        image,
        drivers: driverIds
          ? {
              create: driverIds.map((did) => ({
                driver: { connect: { id: parseInt(did) } },
              })),
            }
          : undefined,
      },
      include: {
        drivers: {
          include: {
            driver: { select: { id: true, name: true, licenseNumber: true, phone: true } },
          },
        },
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Create vehicle error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A vehicle with this registration number already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { registrationNumber, make, model, year, image, driverIds } = req.body;
    const id = parseInt(req.params.id);

    const data = {};
    if (registrationNumber !== undefined) data.registrationNumber = registrationNumber;
    if (make !== undefined) data.make = make;
    if (model !== undefined) data.model = model;
    if (year !== undefined) data.year = year ? parseInt(year) : null;
    if (image !== undefined) data.image = image;

    // Update driver assignments via junction table
    if (driverIds !== undefined) {
      await prisma.driverVehicle.deleteMany({ where: { vehicleId: id } });
      if (driverIds.length > 0) {
        await prisma.driverVehicle.createMany({
          data: driverIds.map((did) => ({
            driverId: parseInt(did),
            vehicleId: id,
          })),
        });
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
      include: {
        drivers: {
          include: {
            driver: { select: { id: true, name: true, licenseNumber: true, phone: true } },
          },
        },
      },
    });

    res.json(vehicle);
  } catch (error) {
    console.error("Update vehicle error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A vehicle with this registration number already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.vehicle.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { list, getOne, create, update, remove };
