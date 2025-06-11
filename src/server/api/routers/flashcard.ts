import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const flashcardRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get all subjects for the user
    const subjects = await ctx.db.subject.findMany({
      where: { userId },
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

  recordReview: protectedProcedure
    .input(
      z.object({
        flashcardId: z.string(),
        quality: z.number().min(0).max(5),
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
          id: input.flashcardId,
          subject: {
            userId,
          },
        },
      });

      if (!flashcard) {
        throw new Error("Flashcard not found or does not belong to user");
      }

      // Create a review log
      await ctx.db.reviewLog.create({
        data: {
          flashcardId: input.flashcardId,
          userId,
          quality: input.quality,
        },
      });

      // Update flashcard spaced repetition values using SM-2 algorithm
      let { repetitionCount, easeFactor, interval } = flashcard;

      // SM-2 algorithm implementation
      if (input.quality >= 3) {
        // Correct response
        if (repetitionCount === 0) {
          interval = 1;
        } else if (repetitionCount === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
        repetitionCount += 1;
      } else {
        // Incorrect response
        repetitionCount = 0;
        interval = 1;
      }

      // Update ease factor based on quality
      easeFactor = Math.max(
        1.3,
        easeFactor +
          (0.1 - (5 - input.quality) * (0.08 + (5 - input.quality) * 0.02)),
      );

      // Calculate next review date
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);

      // Update the flashcard
      return await ctx.db.flashcard.update({
        where: { id: input.flashcardId },
        data: {
          repetitionCount,
          easeFactor,
          interval,
          nextReviewDate,
        },
      });
    }),
});
