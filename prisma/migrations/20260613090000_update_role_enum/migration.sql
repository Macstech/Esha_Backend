-- Remap existing admin-tier users to ADMIN
UPDATE "User" SET "role" = 'ADMIN' WHERE "role" IN ('SUPER_ADMIN', 'EDITOR', 'VIEWER');

-- Recreate the enum without the retired values
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'VENDOR', 'DRIVER', 'SUPERVISOR');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'VENDOR';

DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
