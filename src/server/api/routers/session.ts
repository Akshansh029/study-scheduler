import { startOfDay, endOfDay } from "date-fns";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import moment from "moment";

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

  sessionStats: protectedProcedure.query(async ({ ctx }) => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const weekStart = moment().startOf("week").toDate();
    const weekEnd = moment().endOf("week").toDate();

    // Sessions for today
    const sessions = await ctx.db.studySession.findMany({
      where: {
        userId: ctx.user.userId!,
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

    const completedSessions = await ctx.db.studySession.count({
      where: {
        userId: ctx.user.userId!,
        status: "completed",
        startTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const todayCount = sessions.filter((s) =>
      moment(s.startTime).isSame(new Date(), "day"),
    ).length;

    const completedSessionsPercentage = Math.floor(
      (completedSessions / todayCount) * 100 || 0,
    );

    // total time in milliseconds for today
    const totalStudyTimeMsToday = sessions.reduce((acc, session) => {
      if (session.startTime && session.endTime) {
        return acc + (session.endTime.getTime() - session.startTime.getTime());
      }
      return acc;
    }, 0);

    const totalMinutes = Math.floor(totalStudyTimeMsToday / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const weekSessions = await ctx.db.studySession.findMany({
      where: {
        userId: ctx.user.userId!,
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const completedWeekSessions = await ctx.db.studySession.count({
      where: {
        userId: ctx.user.userId!,
        status: "completed",
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const weekCount = weekSessions.filter((s) =>
      moment(s.startTime).isSame(new Date(), "week"),
    ).length;

    const completedWeekSessionsPercentage = Math.floor(
      (completedWeekSessions / weekCount) * 100 || 0,
    );

    // total time in milliseconds for the week
    const totalStudyTimeMsWeek = weekSessions.reduce((acc, session) => {
      if (session.startTime && session.endTime) {
        return acc + (session.endTime.getTime() - session.startTime.getTime());
      }
      return acc;
    }, 0);

    const totalMinutesWeek = Math.floor(totalStudyTimeMsWeek / (1000 * 60));
    const weekHrs = Math.floor(totalMinutesWeek / 60);
    const weekMins = totalMinutesWeek % 60;

    return {
      hours,
      minutes,
      weekHrs,
      weekMins,
      todayCount,
      weekCount,
      completedSessionsPercentage,
      completedWeekSessionsPercentage,
    };
  }),
});
