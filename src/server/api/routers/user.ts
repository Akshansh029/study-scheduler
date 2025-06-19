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

  updateDailyStudy: protectedProcedure
    .input(
      z.object({
        duration: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const today = moment().startOf("day").toDate();
      return await ctx.db.dailyStudy.upsert({
        where: {
          userId_date: {
            userId: ctx.user.userId!,
            date: today,
          },
        },
        create: {
          userId: ctx.user.userId!,
          date: today,
          totalMs: input.duration,
          sessions: 1,
        },
        update: {
          totalMs: { increment: input.duration },
          sessions: { increment: 1 },
        },
      });
    }),

  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.dailyStudy.findMany({
      where: {
        userId: ctx.user.userId!,
        sessions: { gt: 0 },
      },
      select: { date: true },
      orderBy: { date: "desc" },
    });

    const doneDays = new Set(
      rows.map((r) => moment(r.date).format("YYYY-MM-DD")),
    );

    let streak = 0;
    let cursor = moment().startOf("day");
    while (doneDays.has(cursor.format("YYYY-MM-DD"))) {
      streak++;
      cursor = cursor.subtract(1, "day");
    }
    return { streak };
  }),
});
