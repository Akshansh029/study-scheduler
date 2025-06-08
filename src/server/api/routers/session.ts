import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const sessionRouter = createTRPCRouter({
  createSession: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        startTime: z.date(),
        endTime: z.date(),
        recurrence: z.string().optional(),
        description: z.string().optional(),
        subjectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.studySession.create({
        data: {
          title: input.title,
          startTime: input.startTime,
          endTime: input.endTime,
          recurrence: input.recurrence,
          description: input.description,
          subjectId: input.subjectId,
          userId: ctx.user.userId!,
        },
      });
    }),

  getAllSessions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const sessions = await ctx.db.studySession.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        recurrence: true,
        subjectId: true,
        description: true,
        subject: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return sessions;
  }),
});
