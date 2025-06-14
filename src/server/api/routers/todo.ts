import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const todoRouter = createTRPCRouter({
  createTodo: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.todo.create({
        data: {
          userId: ctx.user.userId!,
          text: input.text,
        },
      });
    }),

  getAllTodos: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    return await ctx.db.todo.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        text: true,
        completed: true,
      },
    });
  }),

  toggleTodo: protectedProcedure
    .input(
      z.object({
        todoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentTodo = await ctx.db.todo.findUnique({
        where: { id: input.todoId },
        select: { completed: true },
      });

      if (!currentTodo) {
        throw new Error("Todo not found");
      }

      return await ctx.db.todo.update({
        where: {
          id: input.todoId,
        },
        data: {
          completed: !currentTodo.completed,
        },
      });
    }),

  deleteTodo: protectedProcedure
    .input(
      z.object({
        todoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.todo.delete({
        where: {
          id: input.todoId,
        },
      });
    }),
});
