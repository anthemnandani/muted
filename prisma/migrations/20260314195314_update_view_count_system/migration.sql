/*
  Warnings:

  - The values [FEED,DIRECT] on the enum `ViewSource` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `contentType` on the `PostView` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ViewContentType" AS ENUM ('VIDEO', 'IMAGE', 'GIF', 'TEXT', 'THREAD');

-- AlterEnum
BEGIN;
CREATE TYPE "ViewSource_new" AS ENUM ('MAIN_FEED', 'VIDEO_FEED', 'FRIENDS_FEED', 'PROFILE', 'SEARCH', 'HASHTAG_FEED', 'POST_DETAIL', 'NOTIFICATION');
ALTER TABLE "PostView" ALTER COLUMN "source" TYPE "ViewSource_new" USING ("source"::text::"ViewSource_new");
ALTER TYPE "ViewSource" RENAME TO "ViewSource_old";
ALTER TYPE "ViewSource_new" RENAME TO "ViewSource";
DROP TYPE "public"."ViewSource_old";
COMMIT;

-- AlterTable
ALTER TABLE "PostView" ADD COLUMN     "threadId" TEXT,
ALTER COLUMN "postId" DROP NOT NULL,
DROP COLUMN "contentType",
ADD COLUMN     "contentType" "ViewContentType" NOT NULL;

-- CreateIndex
CREATE INDEX "PostView_threadId_idx" ON "PostView"("threadId");

-- CreateIndex
CREATE INDEX "PostView_userId_threadId_idx" ON "PostView"("userId", "threadId");

-- AddForeignKey
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
