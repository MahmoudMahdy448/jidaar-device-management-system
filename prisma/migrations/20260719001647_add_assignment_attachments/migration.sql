-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('DEVICE_PHOTO', 'SIGNED_ASSIGNMENT_FORM', 'OTHER');

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_device_id_fkey";

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "assignment_id" UUID,
ADD COLUMN     "attachment_type" "AttachmentType" NOT NULL DEFAULT 'DEVICE_PHOTO',
ADD COLUMN     "uploaded_by_id" UUID,
ALTER COLUMN "device_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "attachments_assignment_id_idx" ON "attachments"("assignment_id");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
