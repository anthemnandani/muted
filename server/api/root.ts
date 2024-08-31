import { postRouter } from './routers/post';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  post: postRouter,
});

export type AppRouter = typeof appRouter;
