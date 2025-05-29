import { authRouter } from './routers/auth';
import { collectionRouter } from './routers/collection';
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
});

export type AppRouter = typeof appRouter;
