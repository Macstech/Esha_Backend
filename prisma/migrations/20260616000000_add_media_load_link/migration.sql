-- AlterTable: add optional loadId to Media
ALTER TABLE "Media" ADD COLUMN "loadId" INTEGER;

-- CreateIndex
CREATE INDEX "Media_loadId_idx" ON "Media"("loadId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_loadId_fkey"
  FOREIGN KEY ("loadId") REFERENCES "loads"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
