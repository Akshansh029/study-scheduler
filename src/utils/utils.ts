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

export function getNearestNextReviewDate(
  subjects: SubjectWithCards[],
): string | null {
  // 1) Extract each subject's earliest date
  const dates = subjects
    .map((subject) => {
      // find this subject's min nextReviewDate
      const minDate = subject.flashcards.reduce<Date | null>((min, card) => {
        if (!min || card.nextReviewDate < min) {
          return card.nextReviewDate;
        }
        return min;
      }, null);
      return minDate;
    })
    // 2) Filter out subjects with no flashcards or nextReviewDate
    .filter((d): d is Date => d !== null && d !== undefined);

  if (dates.length === 0) return null;

  // 3) Find the absolute minimum across all subjects
  const nearest = dates.reduce((min, d) => (d < min! ? d : min), dates[0]);

  // 4) Format and return
  return moment(nearest).format("hh:mm A, MMM DD YYYY");
}
