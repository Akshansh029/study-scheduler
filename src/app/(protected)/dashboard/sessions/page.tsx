"use client";

import FadeLoader from "react-spinners/FadeLoader";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Play,
  Pause,
  Square,
  Clock,
  Brain,
  CheckCircle,
  XCircle,
  RotateCcw,
  Timer,
  Target,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface StudySession {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  subjectId: string;
  subject: {
    id: string;
    title: string;
    color: string;
  };
  description?: string;
  recurrence?: string;
  status: SessionStatus;
}

type SessionStatus =
  | "upcoming"
  | "in-progress"
  | "completed"
  | "overdue"
  | "due-now";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subjectId: string;
  difficulty: "easy" | "medium" | "hard";
  nextReviewDate: Date;
  interval: number;
  repetitionCount: number;
  easeFactor: number;
}

const mockFlashcards: Flashcard[] = [
  {
    id: "1",
    question: "What is the Schrödinger equation?",
    answer:
      "The Schrödinger equation is a linear partial differential equation that governs the wave function of a quantum-mechanical system. It is: iℏ ∂ψ/∂t = Ĥψ",
    subjectId: "1",
    difficulty: "hard",
    nextReviewDate: new Date(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
  },
  {
    id: "2",
    question: "What is the uncertainty principle?",
    answer:
      "The uncertainty principle states that the position and momentum of a particle cannot both be precisely determined at the same time. Δx × Δp ≥ ℏ/2",
    subjectId: "1",
    difficulty: "medium",
    nextReviewDate: new Date(),
    interval: 1,
    repetitionCount: 1,
    easeFactor: 2.5,
  },
  {
    id: "3",
    question: "What is wave-particle duality?",
    answer:
      "Wave-particle duality is the concept that every particle or quantum entity may be described as either a particle or a wave, depending on the experimental setup.",
    subjectId: "1",
    difficulty: "easy",
    nextReviewDate: new Date(),
    interval: 3,
    repetitionCount: 2,
    easeFactor: 2.8,
  },
];

export default function StudySessionsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentFlashcards, setCurrentFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [reviewedCards, setReviewedCards] = useState(0);

  const { data, isPending } = api.session.getAllSessions.useQuery();
  const updateStatusMutation = api.session.updateStatus.useMutation();

  useEffect(() => {
    if (data) {
      setSessions(data as StudySession[]);
    }
  }, [data]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && activeSession) {
      interval = setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeSession]);

  // Separate function to calculate status without side effects
  const calculateStatus = useCallback((session: StudySession) => {
    const now = new Date();
    if (session.status === "completed") return "completed";
    if (session.status === "in-progress") return "in-progress";
    if (now >= session.startTime && now <= session.endTime) return "due-now";
    if (now > session.endTime) return "overdue";
    return "upcoming";
  }, []);

  // Function to handle status updates
  const handleStatusUpdate = useCallback(
    async (sessionId: string, status: string) => {
      try {
        await updateStatusMutation.mutateAsync({
          sessionId,
          updatedStatus: status as SessionStatus,
        });
      } catch (error) {
        toast.error("Failed to update session status");
        console.error("Error updating session status:", error);
      }
    },
    [updateStatusMutation],
  );

  const startSession = (session: StudySession) => {
    setActiveSession(session);
    setSessions(
      sessions?.map((s) =>
        s.id === session.id ? { ...s, status: "in-progress" } : s,
      ),
    );

    // Update status in database
    void handleStatusUpdate(session.id, "in-progress");

    // Load flashcards for this subject
    const subjectCards = mockFlashcards.filter(
      (card) => card.subjectId === session.subjectId,
    );
    setCurrentFlashcards(subjectCards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionTimer(0);
    setIsTimerRunning(true);
    setSessionProgress(0);
    setReviewedCards(0);
  };

  const pauseSession = () => {
    setIsTimerRunning(false);
  };

  const resumeSession = () => {
    setIsTimerRunning(true);
  };

  const endSession = () => {
    if (activeSession) {
      setSessions(
        sessions.map((s) =>
          s.id === activeSession.id ? { ...s, status: "completed" } : s,
        ),
      );
      // Update status in database
      void handleStatusUpdate(activeSession.id, "completed");
    }
    setActiveSession(null);
    setIsTimerRunning(false);
    setSessionTimer(0);
    setCurrentFlashcards([]);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionProgress(0);
    setReviewedCards(0);
  };

  const handleCardRating = (rating: "easy" | "good" | "hard") => {
    if (currentFlashcards?.length === 0) return;

    // Update progress
    const newReviewedCards = reviewedCards + 1;
    setReviewedCards(newReviewedCards);
    setSessionProgress((newReviewedCards / currentFlashcards.length) * 100);

    // Move to next card
    if (currentCardIndex < currentFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      endSession();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "due-now":
        return <Badge className="bg-orange-500">Due Now</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Study Sessions
              </h1>
              <p className="text-gray-600">
                Active recall sessions with spaced repetition
              </p>
            </div>
          </div>
          {activeSession && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Session Timer</div>
                <div className="font-mono text-xl font-bold">
                  {formatTime(sessionTimer)}
                </div>
              </div>
              <div className="flex gap-2">
                {isTimerRunning ? (
                  <Button variant="outline" onClick={pauseSession}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="outline" onClick={resumeSession}>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                )}
                <Button variant="destructive" onClick={endSession}>
                  <Square className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="p-6">
        {!activeSession ? (
          <>
            {/* Stats Overview */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today&apos;s Sessions
                  </CardTitle>
                  <Clock className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.length}</div>
                  <p className="text-muted-foreground text-xs">
                    Scheduled for today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Study Time
                  </CardTitle>
                  <Timer className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.5h</div>
                  <p className="text-muted-foreground text-xs">
                    Planned for today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cards Due
                  </CardTitle>
                  <Brain className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-muted-foreground text-xs">
                    Ready for review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completion Rate
                  </CardTitle>
                  <Target className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-muted-foreground text-xs">This week</p>
                </CardContent>
              </Card>
            </div>

            {/* Session List */}
            {isPending ? (
              <div className="px-auto flex h-64 items-center justify-center">
                <FadeLoader className="h-15 w-15" color="#a5a7a9" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.map((session) => {
                      const status = calculateStatus(session);
                      return (
                        <Card
                          key={session.id}
                          className="py-4 transition-shadow hover:shadow-md"
                        >
                          <CardContent className="px-6 py-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{
                                    backgroundColor: session.subject.color,
                                  }}
                                />
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {session.title}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {session.subject.title}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {session.startTime.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}{" "}
                                    -{" "}
                                    {session.endTime.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {getStatusBadge(status)}
                                <Button
                                  onClick={() => startSession(session)}
                                  disabled={session.status === "completed"}
                                  className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Start Session
                                </Button>
                              </div>
                            </div>
                            {session.description && (
                              <div className="mt-3 border-t border-gray-100 pt-3">
                                <p className="text-sm text-gray-600">
                                  {session.description}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Active Session */
          <div className="mx-auto max-w-4xl space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: activeSession.subject.color }}
                    />
                    <div>
                      <CardTitle className="text-xl">
                        {activeSession.title}
                      </CardTitle>
                      <p className="text-gray-600">
                        {activeSession.subject.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold">
                      {formatTime(sessionTimer)}
                    </div>
                    <p className="text-sm text-gray-600">Session time</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Progress */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium">Progress</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {reviewedCards} of {currentFlashcards.length} cards
                  </span>
                </div>
                <Progress value={sessionProgress} className="h-2" />
              </CardContent>
            </Card>

            {/* Flashcard Interface */}
            {currentFlashcards.length > 0 &&
            currentCardIndex < currentFlashcards.length ? (
              <Card className="min-h-[400px]">
                <CardContent className="p-8">
                  <div className="space-y-6 text-center">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Card {currentCardIndex + 1} of{" "}
                        {currentFlashcards.length}
                      </span>
                      {/* <Badge variant="outline">
                        {currentFlashcards[currentCardIndex].difficulty}
                      </Badge> */}
                    </div>

                    {/* <div className="space-y-8">
                      <div>
                        <h3 className="mb-4 text-lg font-medium text-gray-900">
                          Question:
                        </h3>
                        <p className="text-xl leading-relaxed text-gray-800">
                          {currentFlashcards[currentCardIndex].question}
                        </p>
                      </div>

                      {showAnswer && (
                        <div className="border-t pt-8">
                          <h3 className="mb-4 text-lg font-medium text-gray-900">
                            Answer:
                          </h3>
                          <p className="text-lg leading-relaxed text-gray-700">
                            {currentFlashcards[currentCardIndex].answer}
                          </p>
                        </div>
                      )}
                    </div> */}

                    <div className="pt-8">
                      {!showAnswer ? (
                        <Button
                          onClick={() => setShowAnswer(true)}
                          size="lg"
                          className="px-8"
                        >
                          Show Answer
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            How well did you know this?
                          </p>
                          <div className="flex justify-center gap-4">
                            <Button
                              variant="outline"
                              onClick={() => handleCardRating("hard")}
                              className="flex items-center gap-2"
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                              Hard
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleCardRating("good")}
                              className="flex items-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4 text-yellow-500" />
                              Good
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleCardRating("easy")}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Easy
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Session Complete!
                  </h3>
                  <p className="mb-6 text-gray-600">
                    You&apos;ve reviewed all {currentFlashcards.length} cards in{" "}
                    {formatTime(sessionTimer)}.
                  </p>
                  <Button onClick={endSession} size="lg">
                    Finish Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
