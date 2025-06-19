import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import moment from "moment";

export const userRouter = createTRPCRouter({
  getUserDetails: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: {
        id: ctx.user.userId!,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        emailAddress: true,
        message: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        Todo: {
          select: {
            id: true,
          },
        },
      },
    });
  }),

  changeMessage: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        newMsg: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          message: input.newMsg,
        },
      });
    }),

  changeImage: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        imageUrl: z
          .string()
          .url()
          .optional()
          .or(z.string().startsWith("data:image/").optional()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          imageUrl: input.imageUrl,
        },
      });
    }),

  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await ctx.db.studySession.findMany({
      where: {
        userId: ctx.user.userId!,
        status: "completed",
      },
      select: {
        startTime: true,
      },
    });

    const completedDays = new Set(
      sessions.map((s) => moment(s.startTime).format("YYYY-MM-DD")),
    );

    let streak = 0;
    const currentDay = moment().startOf("day");

    while (completedDays.has(currentDay.format("YYYY-MM-DD"))) {
      streak++;
      currentDay.subtract(1, "day");
    }

    return streak;
  }),
});
