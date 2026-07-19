/*
  Warnings:

  - Added the required column `content` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "content" BYTEA NOT NULL,
ALTER COLUMN "s3_key" DROP NOT NULL;
