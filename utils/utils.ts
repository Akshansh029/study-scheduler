import type { SubjectWithCards } from "@/types";
import moment from "moment";

export function isSubjectOverdue(subject: SubjectWithCards): boolean {
  const now = new Date();

  // Filter out cards that don't have a nextReviewDate
  const validReviewDates = subject.flashcards
    .map((card) => card.nextReviewDate)
    .filter((date): date is Date => date !== null);

  if (validReviewDates.length === 0) return false;

  // Find the earliest date
  const earliestReviewDate = validReviewDates.reduce((min, date) =>
    date < min ? date : min,
  );

  return earliestReviewDate < now;
}

export function getEarliestNextReviewDate(
  subject: SubjectWithCards,
): string | null {
  if (subject.flashcards.length === 0) return null;

  const minDate = subject.flashcards.reduce<Date | null>((min, card) => {
    if (!min || card.nextReviewDate < min) {
      return card.nextReviewDate;
    }
    return min;
  }, null);

  return minDate ? moment(minDate).format("hh:mm A, MMM DD YYYY") : null;
}
