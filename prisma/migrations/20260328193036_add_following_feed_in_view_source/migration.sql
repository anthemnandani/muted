/*
  Warnings:

  - The values [PROFILE,SEARCH,NOTIFICATION] on the enum `ViewSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ViewSource_new" AS ENUM ('MAIN_FEED', 'VIDEO_FEED', 'THREAD_FEED', 'FRIENDS_FEED', 'FOLLOWING_FEED', 'HASHTAG_FEED', 'POST_DETAIL');
ALTER TABLE "PostView" ALTER COLUMN "source" TYPE "ViewSource_new" USING ("source"::text::"ViewSource_new");
ALTER TYPE "ViewSource" RENAME TO "ViewSource_old";
ALTER TYPE "ViewSource_new" RENAME TO "ViewSource";
DROP TYPE "public"."ViewSource_old";
COMMIT;
