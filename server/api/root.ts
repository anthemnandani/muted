import { adminRouter } from './routers/admin';
import { appealRouter } from './routers/appeal';
import { authRouter } from './routers/auth';
import { chatRouter } from './routers/chat';
import { collectionRouter } from './routers/collection';
import { keywordRouter } from './routers/keyword';
import { likeRouter } from './routers/like';
import { notificationRouter } from './routers/notification';
import { postRouter } from './routers/post';
import { reportRouter } from './routers/report';
import { searchRouter } from './routers/search';
import { userRouter } from './routers/user';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  post: postRouter,
  like: likeRouter,
  collection: collectionRouter,
  report: reportRouter,
  search: searchRouter,
  notification: notificationRouter,
  chat: chatRouter,
  keyword: keywordRouter,
  admin: adminRouter,
  appeal: appealRouter,
});

export type AppRouter = typeof appRouter;
