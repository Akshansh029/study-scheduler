import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { subjectRouter } from "./routers/subject";
import { sessionRouter } from "./routers/session";
import { flashcardRouter } from "./routers/flashcard";
import { reviewRouter } from "./routers/review";
import { todoRouter } from "./routers/todo";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  subject: subjectRouter,
  session: sessionRouter,
  flashcard: flashcardRouter,
  review: reviewRouter,
  todo: todoRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
