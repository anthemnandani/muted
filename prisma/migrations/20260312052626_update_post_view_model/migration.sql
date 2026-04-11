/*
  Warnings:

  - You are about to drop the column `viewerId` on the `PostView` table. All the data in the column will be lost.
  - Added the required column `contentType` to the `PostView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMs` to the `PostView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tier` to the `PostView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PostView` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ViewTier" AS ENUM ('IMPRESSION', 'VIEW');

-- DropForeignKey
ALTER TABLE "PostView" DROP CONSTRAINT "PostView_viewerId_fkey";

-- DropIndex
DROP INDEX "PostView_postId_createdAt_idx";

-- DropIndex
DROP INDEX "PostView_viewerId_idx";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PostView" DROP COLUMN "viewerId",
ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "durationMs" INTEGER NOT NULL,
ADD COLUMN     "isSelfView" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tier" "ViewTier" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "source" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "PostView_postId_idx" ON "PostView"("postId");

-- CreateIndex
CREATE INDEX "PostView_userId_postId_idx" ON "PostView"("userId", "postId");

-- CreateIndex
CREATE INDEX "PostView_createdAt_idx" ON "PostView"("createdAt");

-- AddForeignKey
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
