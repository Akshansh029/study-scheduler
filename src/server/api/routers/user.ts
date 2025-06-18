import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
});
