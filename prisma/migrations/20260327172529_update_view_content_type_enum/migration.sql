/*
  Warnings:

  - The values [GIF,TEXT] on the enum `ViewContentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ViewContentType_new" AS ENUM ('VIDEO', 'IMAGE', 'THREAD');
ALTER TABLE "PostView" ALTER COLUMN "contentType" TYPE "ViewContentType_new" USING ("contentType"::text::"ViewContentType_new");
ALTER TYPE "ViewContentType" RENAME TO "ViewContentType_old";
ALTER TYPE "ViewContentType_new" RENAME TO "ViewContentType";
DROP TYPE "public"."ViewContentType_old";
COMMIT;
