import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import moment from "moment";
import { RRule } from "rrule";
import { TRPCError } from "@trpc/server";

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
        recurrenceDays: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.studySession.create({
        data: {
          title: input.title,
          startTime: input.startTime,
          endTime: input.endTime,
          recurrence: input.recurrence,
          recurrenceDays: input.recurrenceDays,
          description: input.description,
          subjectId: input.subjectId,
          userId: ctx.user.userId!,
          nextSessionDate: input.startTime,
          nextSessionEndDate: input.endTime,
        },
      });
    }),

  getSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.studySession.findUnique({
        where: {
          id: input.sessionId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          recurrence: true,
          recurrenceDays: true,
          status: true,
          nextSessionDate: true,
          nextSessionEndDate: true,
          subject: {
            select: {
              id: true,
              title: true,
              color: true,
            },
          },
        },
      });

      return session;
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
        recurrenceDays: true,
        subjectId: true,
        description: true,
        status: true,
        nextSessionDate: true,
        nextSessionEndDate: true,
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
        recurrenceDays: z.array(z.number()).optional(),
        description: z.string().optional(),
        subjectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.studySession.findUnique({
        where: { id: input.id },
      });

      if (!session) throw new Error("Session not found");

      return await ctx.db.studySession.update({
        where: { id: input.id },
        data: {
          title: input.title,
          startTime: input.startTime,
          endTime: input.endTime,
          nextSessionDate: input.startTime,
          nextSessionEndDate: input.endTime,
          recurrence: input.recurrence,
          recurrenceDays: input.recurrenceDays,
          description: input.description,
          subjectId: input.subjectId,
        },
      });
    }),

  updateSessionDate: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        recurrence: z.string(),
        recurrenceDays: z.array(z.number()).optional(),
        nextSessionDate: z.date(),
        nextSessionEndDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Normalize recurrence token
      const recurrence = String(input.recurrence ?? "").toLowerCase();

      let mNext = moment(input.nextSessionDate);
      let endNext = moment(input.nextSessionEndDate);

      if (recurrence === "daily") {
        mNext = mNext.clone().add(1, "day");
        endNext = endNext.clone().add(1, "day");
      } else if (recurrence === "weekly") {
        mNext = mNext.clone().add(1, "week");
        endNext = endNext.clone().add(1, "week");
      } else if (recurrence === "monthly") {
        mNext = mNext.clone().add(1, "month");
        endNext = endNext.clone().add(1, "month");
      } else if (recurrence === "custom") {
        // recurrenceDays must be provided for custom
        const days = input.recurrenceDays;
        if (!Array.isArray(days) || days.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "recurrenceDays is required for custom recurrence.",
          });
        }

        // sanitize & sort unique weekday numbers 0..6 (0=Sun)
        const sortedDays: number[] = Array.from(
          new Set(
            days
              .map((d) => Number(d))
              .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6),
          ),
        ).sort((a, b) => a - b);

        if (sortedDays.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "recurrenceDays must contain at least one valid weekday (0..6).",
          });
        }

        const currentDay = mNext.day(); // 0..6 (Sun..Sat)

        // Find next weekday strictly after currentDay, else wrap to first in list next week
        const nextDayGreater = sortedDays.find((d) => d > currentDay);
        let deltaDays: number;
        if (typeof nextDayGreater === "number") {
          deltaDays = nextDayGreater - currentDay;
        } else {
          // wrap to next week
          if (typeof sortedDays[0] === "undefined") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No valid recurrenceDays found for custom recurrence.",
            });
          }
          deltaDays = 7 - currentDay + sortedDays[0];
        }

        mNext = mNext.clone().add(deltaDays, "days");
        endNext = endNext.clone().add(deltaDays, "days");
      } else {
        console.warn(
          "updateSessionDate: unknown recurrence token, not updating nextSession date:",
          input.recurrence,
        );
      }

      const updated = await ctx.db.studySession.update({
        where: { id: input.sessionId },
        data: {
          nextSessionDate: mNext.toDate(),
          nextSessionEndDate: endNext.toDate(),
        },
      });

      return updated;
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
    const today = new Date();
    const weekStart = moment().startOf("isoWeek").toDate(); // Monday
    const weekEnd = moment().endOf("isoWeek").toDate(); // Sunday

    const sessions = await ctx.db.studySession.findMany({
      where: {
        userId: ctx.user.userId!,
        OR: [
          {
            startTime: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
          {
            recurrence: {
              not: null,
            },
          },
        ],
      },
      select: {
        startTime: true,
        endTime: true,
        nextSessionDate: true,
        nextSessionEndDate: true,
        recurrence: true,
        status: true,
      },
    });

    const occurrencesThisWeek: {
      startTime: Date;
      endTime: Date;
      nextSessionDate: Date;
      status: string;
    }[] = [];

    for (const session of sessions) {
      const duration = session.endTime.getTime() - session.startTime.getTime();

      if (!session.recurrence || session.recurrence === "none") {
        if (session.startTime >= weekStart && session.startTime <= weekEnd) {
          occurrencesThisWeek.push(session);
        }
      } else {
        const rule = new RRule({
          freq:
            session.recurrence === "daily"
              ? RRule.DAILY
              : session.recurrence === "weekly"
                ? RRule.WEEKLY
                : RRule.MONTHLY,
          dtstart: session.startTime,
        });

        // Get occurrences for the entire week (Monday to Sunday)
        const occurrenceDates = rule.between(weekStart, weekEnd, true);

        occurrenceDates.forEach((occ) => {
          occurrencesThisWeek.push({
            startTime: occ,
            endTime: new Date(occ.getTime() + duration),
            status: session.status,
            nextSessionDate: session.nextSessionDate,
          });
        });
      }
    }

    const todayCount = occurrencesThisWeek.filter((s) =>
      moment(s.startTime).isSame(today, "day"),
    ).length;

    const completedSessions = sessions.filter(
      (s) =>
        s.status === "completed" &&
        (moment(s.nextSessionDate).isAfter(today, "day") ||
          moment(s.startTime).isSame(today, "day")),
    ).length;

    const completedSessionsPercentage = Math.floor(
      (completedSessions / todayCount) * 100 || 0,
    );

    const totalStudyTimeMsToday = occurrencesThisWeek.reduce((acc, session) => {
      if (moment(session.startTime).isSame(today, "day")) {
        return acc + (session.endTime.getTime() - session.startTime.getTime());
      }
      return acc;
    }, 0);

    const totalMinutes = Math.round(totalStudyTimeMsToday / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const weekCount = occurrencesThisWeek.length;

    const completedWeekSessions = occurrencesThisWeek.filter(
      (s) => s.status === "completed",
    ).length;

    const completedWeekSessionsPercentage = Math.floor(
      (completedWeekSessions / weekCount) * 100 || 0,
    );

    const totalStudyTimeMsWeek = occurrencesThisWeek.reduce((acc, session) => {
      return acc + (session.endTime.getTime() - session.startTime.getTime());
    }, 0);

    const totalMinutesWeek = Math.round(totalStudyTimeMsWeek / (1000 * 60));
    const weekHrs = Math.floor(totalMinutesWeek / 60);
    const weekMins = totalMinutesWeek % 60;

    return {
      hours,
      minutes,
      weekHrs,
      weekMins,
      todayCount,
      weekCount,
      completedSessions,
      completedSessionsPercentage,
      completedWeekSessionsPercentage,
    };
  }),
});
