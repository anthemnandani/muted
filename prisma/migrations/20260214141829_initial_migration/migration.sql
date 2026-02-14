-- CreateEnum
CREATE TYPE "Privacy" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "PostPrivacy" AS ENUM ('FOLLOWERS', 'FOLLOWED', 'ANYONE', 'MENTIONED');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('VISIBLE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO', 'GIF');

-- CreateEnum
CREATE TYPE "EncodingStatus" AS ENUM ('PROCESSING', 'ENCODED', 'FAILED');

-- CreateEnum
CREATE TYPE "CollectionPrivacy" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'COMMENT', 'FOLLOWER', 'MENTION', 'FOLLOW_REQUEST', 'WARNING', 'SUSPENDED', 'UNSUSPENDED', 'ADMIN_PROMOTED', 'ADMIN_DEMOTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'ACTIONED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "MessageRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'MEDIA');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'SEEN', 'SENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "MessageReportCategory" AS ENUM ('NUDITY_SEXUAL', 'SEXTORTION_INTIMATE_ABUSE', 'REGULATED_GOODS', 'HATE_HARASSMENT', 'FRAUDS_SCAMS', 'MINOR_SAFETY', 'MISINFORMATION', 'VIOLENCE_CRIMINAL', 'SHOCKING_GRAPHIC', 'SUICIDE_SELF_HARM', 'EATING_DISORDER', 'DANGEROUS_ACTIVITIES', 'DECEPTIVE_SPAM', 'PERSONAL_INFO', 'DANGEROUS_GOODS', 'INTELLECTUAL_PROPERTY', 'ADVERTISEMENT_MISMATCH', 'OTHER');

-- CreateEnum
CREATE TYPE "FollowRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "FeedType" AS ENUM ('FOR_YOU', 'FOLLOWING', 'FRIENDS');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'UPHELD', 'OVERTURNED');

-- CreateEnum
CREATE TYPE "SuspensionType" AS ENUM ('STRIKE_BASED', 'MANUAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "fullName" TEXT,
    "image" TEXT,
    "bio" TEXT,
    "link" TEXT,
    "email" TEXT NOT NULL,
    "verified" BOOLEAN DEFAULT false,
    "privacy" "Privacy" NOT NULL DEFAULT 'PUBLIC',
    "deactivated" BOOLEAN DEFAULT false,
    "deactivatedAt" TIMESTAMP(3),
    "deletionOtp" TEXT,
    "deletionOtpExpiresAt" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "suspensionEndDate" TIMESTAMP(3),
    "is_admin" BOOLEAN DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "text" TEXT,
    "parentPostId" TEXT,
    "quoteId" TEXT,
    "privacy" "PostPrivacy" NOT NULL DEFAULT 'ANYONE',
    "repliesCount" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT,
    "hideLikes" BOOLEAN NOT NULL DEFAULT false,
    "turnOffComments" BOOLEAN NOT NULL DEFAULT false,
    "status" "PostStatus" NOT NULL DEFAULT 'HIDDEN',
    "lastEditedAt" TIMESTAMP(3),
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "linkPreviewId" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "path" TEXT,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "repliesCount" INTEGER NOT NULL DEFAULT 0,
    "hideLikes" BOOLEAN NOT NULL DEFAULT false,
    "turnOffComments" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "quoteId" TEXT,
    "linkPreviewUrl" TEXT,
    "lastEditedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "privacy" "PostPrivacy" NOT NULL DEFAULT 'ANYONE',
    "status" "PostStatus" NOT NULL DEFAULT 'HIDDEN',

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT,
    "fileType" "FileType" NOT NULL,
    "altText" TEXT,
    "originalDimensions" JSONB,
    "aspectRatio" TEXT,
    "videoId" TEXT,
    "playbackId" TEXT,
    "thumbnailUrl" TEXT,
    "videoToken" TEXT,
    "thumbnailToken" TEXT,
    "encodingStatus" "EncodingStatus",
    "postId" TEXT,
    "threadId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT,
    "threadId" TEXT,
    "userId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "threadId" TEXT,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "threadId" TEXT,

    CONSTRAINT "Repost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "collectionId" TEXT,
    "postId" TEXT,
    "threadId" TEXT,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "privacy" "CollectionPrivacy" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "senderUserId" TEXT,
    "receiverUserId" TEXT,
    "postId" TEXT,
    "threadId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hashtag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkPreview" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkPreview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiddenPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "HiddenPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiddenThread" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "HiddenThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutedUser" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mutedUserId" TEXT NOT NULL,
    "mutedByUserId" TEXT NOT NULL,

    CONSTRAINT "MutedUser_pkey" PRIMARY KEY ("mutedUserId","mutedByUserId")
);

-- CreateTable
CREATE TABLE "BlockedUser" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUserId" TEXT NOT NULL,
    "blockingUserId" TEXT NOT NULL,

    CONSTRAINT "BlockedUser_pkey" PRIMARY KEY ("blockedUserId","blockingUserId")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT,
    "threadId" TEXT,
    "userId" TEXT,
    "reporterId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "detailId" TEXT,
    "reason" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "targetUserId" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatDeletion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChatDeletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutedChat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MutedChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senderId" TEXT,
    "receiverId" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "messageRequest" BOOLEAN NOT NULL DEFAULT false,
    "messageRequestStatus" "MessageRequestStatus",
    "requestedById" TEXT,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "chatId" TEXT NOT NULL,
    "senderId" TEXT,
    "readAt" TIMESTAMP(3),
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emoji" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MessageReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageDeletion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageDeletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "messageId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "category" "MessageReportCategory" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "MessageReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "MessageReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FollowRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilteredKeyword" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "feeds" "FeedType"[],

    CONSTRAINT "FilteredKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "relatedPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Strike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appeal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "suspensionId" TEXT NOT NULL,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suspension" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" "SuspensionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "strikeId" TEXT,

    CONSTRAINT "Suspension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostHashtags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostHashtags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ThreadHashtags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ThreadHashtags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_created_at_id_key" ON "User"("created_at", "id");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_parentPostId_idx" ON "Post"("parentPostId");

-- CreateIndex
CREATE INDEX "Post_path_idx" ON "Post"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Post_createdAt_id_key" ON "Post"("createdAt", "id");

-- CreateIndex
CREATE INDEX "Thread_authorId_idx" ON "Thread"("authorId");

-- CreateIndex
CREATE INDEX "Thread_parentId_idx" ON "Thread"("parentId");

-- CreateIndex
CREATE INDEX "Thread_quoteId_idx" ON "Thread"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Thread_createdAt_id_key" ON "Thread"("createdAt", "id");

-- CreateIndex
CREATE INDEX "Media_postId_idx" ON "Media"("postId");

-- CreateIndex
CREATE INDEX "Media_threadId_idx" ON "Media"("threadId");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE INDEX "Mention_postId_idx" ON "Mention"("postId");

-- CreateIndex
CREATE INDEX "Mention_threadId_idx" ON "Mention"("threadId");

-- CreateIndex
CREATE INDEX "Mention_userId_idx" ON "Mention"("userId");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE INDEX "Like_postId_idx" ON "Like"("postId");

-- CreateIndex
CREATE INDEX "Like_threadId_idx" ON "Like"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_threadId_key" ON "Like"("userId", "threadId");

-- CreateIndex
CREATE INDEX "Repost_userId_idx" ON "Repost"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Repost_userId_postId_key" ON "Repost"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Repost_userId_threadId_key" ON "Repost"("userId", "threadId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_collectionId_idx" ON "Bookmark"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_postId_collectionId_key" ON "Bookmark"("userId", "postId", "collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_threadId_key" ON "Bookmark"("userId", "threadId");

-- CreateIndex
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_name_userId_key" ON "Collection"("name", "userId");

-- CreateIndex
CREATE INDEX "Notification_receiverUserId_idx" ON "Notification"("receiverUserId");

-- CreateIndex
CREATE INDEX "Notification_senderUserId_idx" ON "Notification"("senderUserId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Hashtag_name_key" ON "Hashtag"("name");

-- CreateIndex
CREATE INDEX "Hashtag_name_idx" ON "Hashtag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LinkPreview_url_key" ON "LinkPreview"("url");

-- CreateIndex
CREATE INDEX "LinkPreview_url_idx" ON "LinkPreview"("url");

-- CreateIndex
CREATE INDEX "HiddenPost_userId_idx" ON "HiddenPost"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HiddenPost_userId_postId_key" ON "HiddenPost"("userId", "postId");

-- CreateIndex
CREATE INDEX "HiddenThread_userId_idx" ON "HiddenThread"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HiddenThread_userId_threadId_key" ON "HiddenThread"("userId", "threadId");

-- CreateIndex
CREATE INDEX "MutedUser_mutedByUserId_idx" ON "MutedUser"("mutedByUserId");

-- CreateIndex
CREATE INDEX "BlockedUser_blockingUserId_idx" ON "BlockedUser"("blockingUserId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "Report_categoryId_idx" ON "Report"("categoryId");

-- CreateIndex
CREATE INDEX "Report_postId_idx" ON "Report"("postId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_createdAt_id_key" ON "Report"("createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_postId_key" ON "Report"("reporterId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_threadId_key" ON "Report"("reporterId", "threadId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_userId_key" ON "Report"("reporterId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchQuery_query_key" ON "SearchQuery"("query");

-- CreateIndex
CREATE INDEX "SearchQuery_query_idx" ON "SearchQuery"("query");

-- CreateIndex
CREATE INDEX "SearchQuery_count_idx" ON "SearchQuery"("count");

-- CreateIndex
CREATE INDEX "ChatDeletion_chatId_idx" ON "ChatDeletion"("chatId");

-- CreateIndex
CREATE INDEX "ChatDeletion_userId_idx" ON "ChatDeletion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatDeletion_chatId_userId_key" ON "ChatDeletion"("chatId", "userId");

-- CreateIndex
CREATE INDEX "MutedChat_chatId_idx" ON "MutedChat"("chatId");

-- CreateIndex
CREATE INDEX "MutedChat_userId_idx" ON "MutedChat"("userId");

-- CreateIndex
CREATE INDEX "MutedChat_isActive_idx" ON "MutedChat"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MutedChat_chatId_userId_key" ON "MutedChat"("chatId", "userId");

-- CreateIndex
CREATE INDEX "Chat_senderId_idx" ON "Chat"("senderId");

-- CreateIndex
CREATE INDEX "Chat_receiverId_idx" ON "Chat"("receiverId");

-- CreateIndex
CREATE INDEX "Chat_lastMessageAt_idx" ON "Chat"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Chat_messageRequest_idx" ON "Chat"("messageRequest");

-- CreateIndex
CREATE INDEX "Chat_messageRequestStatus_idx" ON "Chat"("messageRequestStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_senderId_receiverId_key" ON "Chat"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "MessageReaction_messageId_idx" ON "MessageReaction"("messageId");

-- CreateIndex
CREATE INDEX "MessageReaction_userId_idx" ON "MessageReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReaction_messageId_userId_key" ON "MessageReaction"("messageId", "userId");

-- CreateIndex
CREATE INDEX "MessageDeletion_messageId_idx" ON "MessageDeletion"("messageId");

-- CreateIndex
CREATE INDEX "MessageDeletion_userId_idx" ON "MessageDeletion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageDeletion_messageId_userId_key" ON "MessageDeletion"("messageId", "userId");

-- CreateIndex
CREATE INDEX "MessageReport_messageId_idx" ON "MessageReport"("messageId");

-- CreateIndex
CREATE INDEX "MessageReport_reporterId_idx" ON "MessageReport"("reporterId");

-- CreateIndex
CREATE INDEX "MessageReport_targetUserId_idx" ON "MessageReport"("targetUserId");

-- CreateIndex
CREATE INDEX "MessageReport_status_idx" ON "MessageReport"("status");

-- CreateIndex
CREATE INDEX "MessageReport_category_idx" ON "MessageReport"("category");

-- CreateIndex
CREATE INDEX "MessageReport_createdAt_idx" ON "MessageReport"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReport_reporterId_messageId_key" ON "MessageReport"("reporterId", "messageId");

-- CreateIndex
CREATE INDEX "FollowRequest_requesterId_idx" ON "FollowRequest"("requesterId");

-- CreateIndex
CREATE INDEX "FollowRequest_receiverId_idx" ON "FollowRequest"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowRequest_requesterId_receiverId_key" ON "FollowRequest"("requesterId", "receiverId");

-- CreateIndex
CREATE INDEX "FilteredKeyword_userId_idx" ON "FilteredKeyword"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FilteredKeyword_userId_keyword_key" ON "FilteredKeyword"("userId", "keyword");

-- CreateIndex
CREATE INDEX "Strike_userId_idx" ON "Strike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Appeal_suspensionId_key" ON "Appeal"("suspensionId");

-- CreateIndex
CREATE INDEX "Appeal_userId_idx" ON "Appeal"("userId");

-- CreateIndex
CREATE INDEX "Appeal_status_idx" ON "Appeal"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Appeal_createdAt_id_key" ON "Appeal"("createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Suspension_strikeId_key" ON "Suspension"("strikeId");

-- CreateIndex
CREATE INDEX "Suspension_userId_idx" ON "Suspension"("userId");

-- CreateIndex
CREATE INDEX "Suspension_isActive_idx" ON "Suspension"("isActive");

-- CreateIndex
CREATE INDEX "_PostHashtags_B_index" ON "_PostHashtags"("B");

-- CreateIndex
CREATE INDEX "_ThreadHashtags_B_index" ON "_ThreadHashtags"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_linkPreviewId_fkey" FOREIGN KEY ("linkPreviewId") REFERENCES "LinkPreview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_linkPreviewUrl_fkey" FOREIGN KEY ("linkPreviewUrl") REFERENCES "LinkPreview"("url") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repost" ADD CONSTRAINT "Repost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repost" ADD CONSTRAINT "Repost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repost" ADD CONSTRAINT "Repost_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiverUserId_fkey" FOREIGN KEY ("receiverUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenPost" ADD CONSTRAINT "HiddenPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenPost" ADD CONSTRAINT "HiddenPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenThread" ADD CONSTRAINT "HiddenThread_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenThread" ADD CONSTRAINT "HiddenThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutedUser" ADD CONSTRAINT "MutedUser_mutedUserId_fkey" FOREIGN KEY ("mutedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutedUser" ADD CONSTRAINT "MutedUser_mutedByUserId_fkey" FOREIGN KEY ("mutedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_blockingUserId_fkey" FOREIGN KEY ("blockingUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatDeletion" ADD CONSTRAINT "ChatDeletion_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatDeletion" ADD CONSTRAINT "ChatDeletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutedChat" ADD CONSTRAINT "MutedChat_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutedChat" ADD CONSTRAINT "MutedChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDeletion" ADD CONSTRAINT "MessageDeletion_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDeletion" ADD CONSTRAINT "MessageDeletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReport" ADD CONSTRAINT "MessageReport_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReport" ADD CONSTRAINT "MessageReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReport" ADD CONSTRAINT "MessageReport_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowRequest" ADD CONSTRAINT "FollowRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowRequest" ADD CONSTRAINT "FollowRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilteredKeyword" ADD CONSTRAINT "FilteredKeyword_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strike" ADD CONSTRAINT "Strike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_suspensionId_fkey" FOREIGN KEY ("suspensionId") REFERENCES "Suspension"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_strikeId_fkey" FOREIGN KEY ("strikeId") REFERENCES "Strike"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostHashtags" ADD CONSTRAINT "_PostHashtags_A_fkey" FOREIGN KEY ("A") REFERENCES "Hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostHashtags" ADD CONSTRAINT "_PostHashtags_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ThreadHashtags" ADD CONSTRAINT "_ThreadHashtags_A_fkey" FOREIGN KEY ("A") REFERENCES "Hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ThreadHashtags" ADD CONSTRAINT "_ThreadHashtags_B_fkey" FOREIGN KEY ("B") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
