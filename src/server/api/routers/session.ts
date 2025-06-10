import { startOfDay, endOfDay } from "date-fns";
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
        status: true,
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

  updateSession: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        startTime: z.date(),
        endTime: z.date(),
        recurrence: z.string().optional(),
        description: z.string().optional(),
        subjectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.studySession.update({
        where: { id: input.id },
        data: {
          title: input.title,
          startTime: input.startTime,
          endTime: input.endTime,
          recurrence: input.recurrence,
          description: input.description,
          subjectId: input.subjectId,
        },
      });
    }),

  deleteSession: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.studySession.delete({
        where: { id: input.id },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        updatedStatus: z.enum([
          "upcoming",
          "in-progress",
          "completed",
          "overdue",
          "due-now",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.studySession.findUnique({
        where: { id: input.sessionId },
      });

      if (!session) {
        throw new Error("Session not found");
      }
      return await ctx.db.studySession.update({
        where: { id: input.sessionId },
        data: { status: input.updatedStatus },
      });
    }),

  studyTime: protectedProcedure.query(async ({ ctx }) => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const sessions = await ctx.db.studySession.findMany({
      where: {
        userId: ctx.user.userId!,
        status: "completed",
        startTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Calculate total study time in milliseconds
    const totalStudyTimeMs = sessions.reduce((acc, session) => {
      if (session.startTime && session.endTime) {
        return acc + (session.endTime.getTime() - session.startTime.getTime());
      }
      return acc;
    }, 0);

    const totalMinutes = Math.floor(totalStudyTimeMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      totalStudyTimeMs,
      totalStudyTime: {
        hours,
        minutes,
      },
    };
  }),
});
