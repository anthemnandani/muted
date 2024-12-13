import { currentUser } from '@clerk/nextjs';
import { TRPCError, initTRPC } from '@trpc/server';
import { type NextRequest } from 'next/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { db } from '../db';

interface CreateContextOptions {
  headers: Headers;
  user?: Awaited<ReturnType<typeof currentUser>>;
}

export const createInnerTRPCContext = async (opts: CreateContextOptions) => {
  const user = opts.user ?? (await currentUser());
  return {
    headers: opts.headers,
    db,
    userId: user?.id,
    user,
  };
};

export const createTRPCContext = (opts: { req: NextRequest }) => {
  return createInnerTRPCContext({
    headers: opts.req.headers,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
  const user = await currentUser();
  if (!user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
