import type { SubjectWithCards } from "@/types";
import moment from "moment";

export function isSubjectOverdue(subject: SubjectWithCards): boolean {
  const todayStart = moment().startOf("day");

  return subject.flashcards.some((card) => {
    return (
      card.nextReviewDate !== null &&
      moment(card.nextReviewDate).isSameOrBefore(todayStart, "day")
    );
  });
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
