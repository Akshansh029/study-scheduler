import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const subjectRouter = createTRPCRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany();
  }),

  createSubject: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        color: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.subject.create({
        data: {
          title: input.title,
          color: input.color,
          userId: ctx.user.userId!,
        },
      });
    }),

  getSubjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.subject.findMany({
      where: {
        userId: ctx.user.userId!,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  updateSubject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        color: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.subject.update({
        where: {
          id: input.id,
          userId: ctx.user.userId!,
        },
        data: {
          title: input.title,
          color: input.color,
        },
      });
    }),

  deleteSubject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.subject.delete({
        where: {
          id: input.id,
          userId: ctx.user.userId!,
        },
      });
    }),
});
