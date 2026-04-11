/*
  Warnings:

  - You are about to drop the column `groupKey` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isSelfView` on the `PostView` table. All the data in the column will be lost.
  - You are about to drop the `FollowerSnapshot` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "ViewSource" ADD VALUE 'THREAD_FEED';

-- DropForeignKey
ALTER TABLE "FollowerSnapshot" DROP CONSTRAINT "FollowerSnapshot_userId_fkey";

-- DropIndex
DROP INDEX "Notification_receiverUserId_groupKey_idx";

-- DropIndex
DROP INDEX "Notification_receiverUserId_read_idx";

-- DropIndex
DROP INDEX "PostView_source_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "groupKey";

-- AlterTable
ALTER TABLE "PostView" DROP COLUMN "isSelfView";

-- DropTable
DROP TABLE "FollowerSnapshot";
