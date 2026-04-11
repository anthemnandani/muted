-- CreateEnum
CREATE TYPE "ViewSource" AS ENUM ('FEED', 'PROFILE', 'SEARCH', 'DIRECT');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "groupKey" TEXT;

-- CreateTable
CREATE TABLE "PostView" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "viewerId" TEXT,
    "source" "ViewSource" NOT NULL DEFAULT 'FEED',

    CONSTRAINT "PostView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowerSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "followerCount" INTEGER NOT NULL,
    "friendCount" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowerSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostView_postId_createdAt_idx" ON "PostView"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "PostView_viewerId_idx" ON "PostView"("viewerId");

-- CreateIndex
CREATE INDEX "PostView_source_idx" ON "PostView"("source");

-- CreateIndex
CREATE INDEX "FollowerSnapshot_userId_date_idx" ON "FollowerSnapshot"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FollowerSnapshot_userId_date_key" ON "FollowerSnapshot"("userId", "date");

-- CreateIndex
CREATE INDEX "Notification_receiverUserId_groupKey_idx" ON "Notification"("receiverUserId", "groupKey");

-- CreateIndex
CREATE INDEX "Notification_receiverUserId_read_idx" ON "Notification"("receiverUserId", "read");

-- AddForeignKey
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowerSnapshot" ADD CONSTRAINT "FollowerSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
