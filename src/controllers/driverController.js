const { prisma } = require("../config/prisma");

const { parseRefineParams } = require("../utils/queryHelper");



const list = async (req, res) => {
  try {
    const params = parseRefineParams(req.query, ["name", "licenseNumber"]);

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        ...params,
        include: {
          vehicles: {
            include: {
              vehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
            },
          },
        },
      }),
      prisma.driver.count({ where: params.where }),
    ]);

    res.setHeader("x-total-count", total);
    res.setHeader("Access-Control-Expose-Headers", "x-total-count");
    res.json(drivers);
  } catch (error) {
    console.error("List drivers error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOne = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vehicles: {
          include: {
            vehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
          },
        },
      },
    });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { name, licenseNumber, phone, fileAttachment, vehicleIds } = req.body;

    const driver = await prisma.driver.create({
      data: {
        name,
        licenseNumber,
        phone,
        fileAttachment,
        vehicles: vehicleIds
          ? {
              create: vehicleIds.map((vid) => ({
                vehicle: { connect: { id: parseInt(vid) } },
              })),
            }
          : undefined,
      },
      include: {
        vehicles: {
          include: {
            vehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
          },
        },
      },
    });

    res.status(201).json(driver);
  } catch (error) {
    console.error("Create driver error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A driver with this license number already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { name, licenseNumber, phone, fileAttachment, vehicleIds } = req.body;
    const id = parseInt(req.params.id);

    const data = {};
    if (name !== undefined) data.name = name;
    if (licenseNumber !== undefined) data.licenseNumber = licenseNumber;
    if (phone !== undefined) data.phone = phone;
    if (fileAttachment !== undefined) data.fileAttachment = fileAttachment;

    // Update vehicle assignments via junction table
    if (vehicleIds !== undefined) {
      // Delete existing assignments and recreate
      await prisma.driverVehicle.deleteMany({ where: { driverId: id } });
      if (vehicleIds.length > 0) {
        await prisma.driverVehicle.createMany({
          data: vehicleIds.map((vid) => ({
            driverId: id,
            vehicleId: parseInt(vid),
          })),
        });
      }
    }

    const driver = await prisma.driver.update({
      where: { id },
      data,
      include: {
        vehicles: {
          include: {
            vehicle: { select: { id: true, registrationNumber: true, make: true, model: true } },
          },
        },
      },
    });

    res.json(driver);
  } catch (error) {
    console.error("Update driver error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A driver with this license number already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.driver.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { list, getOne, create, update, remove };
