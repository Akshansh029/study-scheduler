import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const reviewRouter = createTRPCRouter({
  getSubjectWithCards: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const subjects = await ctx.db.subject.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
        color: true,
        flashcards: {
          select: {
            id: true,
            question: true,
            answer: true,
            repetitionCount: true,
            easeFactor: true,
            nextReviewDate: true,
            interval: true,
          },
          orderBy: {
            nextReviewDate: "asc",
          },
        },
      },
    });

    return subjects.filter((subject) => subject.flashcards.length > 0);
  }),

  getCardsPerSubject: protectedProcedure
    .input(
      z.object({
        subjectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.userId;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const flashcards = await ctx.db.flashcard.findMany({
        where: {
          subjectId: input.subjectId,
        },
        select: {
          id: true,
          question: true,
          answer: true,
          repetitionCount: true,
          easeFactor: true,
          nextReviewDate: true,
          interval: true,
          subjectId: true,
          userId: true,
          subject: {
            select: {
              id: true,
              title: true,
              color: true,
              userId: true,
            },
          },
        },
      });

      return flashcards;
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

      // Verification of flashcard
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

      // Create review log
      await ctx.db.reviewLog.create({
        data: {
          flashcardId: input.flashcardId,
          userId,
          quality: input.quality,
        },
      });

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
