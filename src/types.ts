export interface StudySession {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  subjectId: string;
  nextSessionDate: Date;
  subject: { id: string; title: string; color: string };
  recurrence?: string | null;
  description?: string | null;
  status: "upcoming" | "in-progress" | "completed" | "due-now" | "overdue";
}

export type SessionStatus =
  | "upcoming"
  | "in-progress"
  | "completed"
  | "overdue"
  | "due-now";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subjectId: string;
  difficulty: "easy" | "medium" | "hard";
  nextReviewDate: Date;
  interval: number;
  repetitionCount: number;
  easeFactor: number;
  subject: {
    id: string;
    title: string;
    color: string;
  };
}

export type RecType = "none" | "daily" | "weekly" | "monthly";

export interface FormState {
  title: string;
  subjectId: string;
  startTime: string;
  endTime: string;
  recurrence: RecType;
  description: string;
}

export interface Subject {
  id: string;
  title: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export type FormInput = {
  title: string;
  color: string;
};

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: StudySession;
}

export interface CalendarComponentProps {
  events: CalendarEvent[];
  onSelectEvent: (session: StudySession) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  eventPropGetter?: (event: CalendarEvent) => { style: React.CSSProperties };
  isLoading?: boolean;
}

export interface RRuleConfig {
  freq: string;
  dtstart: Date | string;
  until?: Date | string;
}

export interface ReviewFlashcard {
  id: string;
  question: string;
  answer: string;
  repetitionCount: number;
  easeFactor: number;
  nextReviewDate: Date;
  interval: number;
}

export interface SubjectWithCards {
  id: string;
  title: string;
  color: string;
  flashcards: ReviewFlashcard[];
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
