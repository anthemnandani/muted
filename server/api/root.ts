import { authRouter } from './routers/auth';
import { likeRouter } from './routers/like';
import { postRouter } from './routers/post';
import { userRouter } from './routers/user';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  post: postRouter,
  like: likeRouter,
});

export type AppRouter = typeof appRouter;
