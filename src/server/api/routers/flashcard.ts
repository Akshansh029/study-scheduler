import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import moment from "moment";

export const flashcardRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get all subjects for the user
    const subjects = await ctx.db.subject.findMany({
      where: { userId },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        color: true,
      },
    });

    // Get all flashcards for the user's subjects
    const flashcards = await ctx.db.flashcard.findMany({
      where: {
        subject: {
          userId,
        },
      },
      include: {
        subject: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
    });

    return { flashcards, subjects };
  }),

  create: protectedProcedure
    .input(
      z.object({
        question: z.string(),
        answer: z.string(),
        subjectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Verify the subject belongs to the user
      const subject = await ctx.db.subject.findFirst({
        where: {
          id: input.subjectId,
          userId,
        },
      });

      if (!subject) {
        throw new Error("Subject not found or does not belong to user");
      }

      // Create the flashcard with default spaced repetition values
      return await ctx.db.flashcard.create({
        data: {
          userId,
          question: input.question,
          answer: input.answer,
          subjectId: input.subjectId,
          repetitionCount: 0,
          easeFactor: 2.5,
          interval: 1,
          nextReviewDate: new Date(),
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        question: z.string(),
        answer: z.string(),
        subjectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Verify the flashcard belongs to the user
      const flashcard = await ctx.db.flashcard.findFirst({
        where: {
          id: input.id,
          subject: {
            userId,
          },
        },
      });

      if (!flashcard) {
        throw new Error("Flashcard not found or does not belong to user");
      }

      // Verify the subject belongs to the user
      const subject = await ctx.db.subject.findFirst({
        where: {
          id: input.subjectId,
          userId,
        },
      });

      if (!subject) {
        throw new Error("Subject not found or does not belong to user");
      }

      // Update the flashcard
      return await ctx.db.flashcard.update({
        where: { id: input.id },
        data: {
          question: input.question,
          answer: input.answer,
          subjectId: input.subjectId,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      await ctx.db.reviewLog.deleteMany({
        where: {
          userId: userId,
          flashcardId: input,
        },
      });

      // Verify the flashcard belongs to the user
      const flashcard = await ctx.db.flashcard.findFirst({
        where: {
          id: input,
          subject: {
            userId,
          },
        },
      });

      if (!flashcard) {
        throw new Error("Flashcard not found or does not belong to user");
      }

      // Delete the flashcard
      return await ctx.db.flashcard.delete({
        where: { id: input },
      });
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId!;
    const flashcards = await ctx.db.flashcard.findMany({
      where: {
        subject: {
          userId,
        },
      },
      include: {
        subject: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
    });

    const totalFlashcards = flashcards.length;
    const dueToday = flashcards.filter((card) =>
      moment(card.nextReviewDate).isSameOrBefore(moment(), "day"),
    ).length;
    const completedThisWeek = flashcards.filter(
      (card) =>
        card.repetitionCount > 0 &&
        moment(card.updatedAt).isAfter(moment().subtract(7, "days")),
    ).length;
    const averageEaseFactor =
      flashcards.length > 0
        ? Math.round(
            (flashcards.reduce((sum, card) => sum + card.easeFactor, 0) /
              flashcards.length) *
              100,
          ) / 100
        : 0;

    return {
      totalFlashcards,
      dueToday,
      completedThisWeek,
      averageEaseFactor,
    };
  }),
});
