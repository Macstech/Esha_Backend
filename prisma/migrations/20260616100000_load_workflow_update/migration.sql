-- Add ASSIGNED value to LoadStatus enum
ALTER TYPE "LoadStatus" ADD VALUE IF NOT EXISTS 'ASSIGNED';

-- Make vehicleId and driverId nullable on loads table
ALTER TABLE "loads" ALTER COLUMN "vehicleId" DROP NOT NULL;
ALTER TABLE "loads" ALTER COLUMN "driverId" DROP NOT NULL;

-- Drop existing foreign key constraints and recreate with ON DELETE SET NULL
ALTER TABLE "loads" DROP CONSTRAINT IF EXISTS "loads_vehicleId_fkey";
ALTER TABLE "loads" DROP CONSTRAINT IF EXISTS "loads_driverId_fkey";

ALTER TABLE "loads" ADD CONSTRAINT "loads_vehicleId_fkey"
  FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "loads" ADD CONSTRAINT "loads_driverId_fkey"
  FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
