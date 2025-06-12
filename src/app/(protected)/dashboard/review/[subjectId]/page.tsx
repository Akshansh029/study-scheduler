"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Brain,
  CheckCircle,
  Clock,
  RotateCcw,
  XCircle,
  ArrowRight,
  Trophy,
  Target,
  Zap,
  ArrowLeft,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";

interface ReviewLog {
  id?: string;
  createdAt?: Date;
  reviewDate: Date;
  quality: number;
  flashcardId: string;
  userId: string;
}

interface ReviewSession {
  totalCards: number;
  completedCards: number;
  correctAnswers: number;
  startTime: Date;
  reviews: ReviewLog[];
}

export default function SubjectReviewPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const userId = "user1"; // In a real app, this would come from auth context

  // State for flashcards and review session
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(
    null,
  );
  const [cardStartTime, setCardStartTime] = useState<Date>(new Date());
  const [sessionComplete, setSessionComplete] = useState(false);

  const {
    data: flashcardsData,
    isLoading,
    error,
  } = api.review.getCardsPerSubject.useQuery({
    subjectId,
  });

  const flashcards = flashcardsData ?? [];

  const dueCards = flashcards.filter((card) =>
    moment(card.nextReviewDate).isSameOrBefore(moment(), "day"),
  );

  // Initialize review session when flashcards are loaded
  useEffect(() => {
    if (flashcardsData && !reviewSession && dueCards.length > 0) {
      setReviewSession({
        totalCards: dueCards.length,
        completedCards: 0,
        correctAnswers: 0,
        startTime: new Date(),
        reviews: [],
      });
    }
  }, [flashcardsData, reviewSession, dueCards.length]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to load flashcards");
    }
  }, [error]);

  // Reset card start time when moving to next card
  useEffect(() => {
    setCardStartTime(new Date());
  }, [currentCardIndex]);

  // FIXED: Use dueCards instead of all flashcards for calculations
  const progress =
    dueCards.length > 0 && reviewSession
      ? (reviewSession.completedCards / dueCards.length) * 100
      : 0;

  const accuracy =
    reviewSession && reviewSession.completedCards > 0
      ? (reviewSession.correctAnswers / reviewSession.completedCards) * 100
      : 0;

  const sessionDuration = reviewSession
    ? moment().diff(moment(reviewSession.startTime), "minutes")
    : 0;

  const averageTimePerCard =
    reviewSession && reviewSession.completedCards > 0
      ? sessionDuration / reviewSession.completedCards
      : 0;

  // FIXED: Get current flashcard from dueCards instead of all flashcards
  const currentCard = dueCards[currentCardIndex];
  const subject = currentCard?.subject;

  // Handle rating a flashcard
  const handleRating = async (quality: number) => {
    if (!currentCard || !reviewSession) return;

    // Create review log according to schema
    const reviewLog: ReviewLog = {
      reviewDate: new Date(),
      quality,
      flashcardId: currentCard.id,
      userId,
    };

    // Update session state
    const updatedSession = {
      ...reviewSession,
      completedCards: reviewSession.completedCards + 1,
      correctAnswers: reviewSession.correctAnswers + (quality >= 3 ? 1 : 0),
      reviews: [...reviewSession.reviews, reviewLog],
    };
    setReviewSession(updatedSession);

    // TODO: Call tRPC mutation to record review
    // await api.flashcard.recordReview.mutate({
    //   flashcardId: currentCard.id,
    //   quality,
    //   userId,
    // })

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // FIXED: Move to next card or complete session based on dueCards
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      toast.success("Review recorded!");
    } else {
      setSessionComplete(true);
      toast.success("Review session complete!");
    }
  };

  // Rating options with colors and descriptions
  const ratingOptions = [
    {
      quality: 0,
      label: "Again",
      description: "Complete blackout",
      color: "bg-red-500 hover:bg-red-600",
      icon: <XCircle className="h-4 w-4" />,
    },
    {
      quality: 3,
      label: "Hard",
      description: "Correct with serious difficulty",
      color: "bg-orange-500 hover:bg-orange-600",
      icon: <RotateCcw className="h-4 w-4" />,
    },
    {
      quality: 4,
      label: "Good",
      description: "Correct after hesitation",
      color: "bg-blue-500 hover:bg-blue-600",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      quality: 5,
      label: "Easy",
      description: "Perfect response",
      color: "bg-green-500 hover:bg-green-600",
      icon: <Zap className="h-4 w-4" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Loading Review...
              </h1>
            </div>
          </div>
        </header>
        <div className="p-6">
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="mx-auto mb-4 h-16 w-16 animate-pulse text-gray-400" />
                <p className="text-gray-600">Loading your flashcards...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // FIXED: Check for dueCards instead of all flashcards
  if (dueCards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/review">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reviews
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">No Cards Due</h1>
              <p className="text-gray-600">
                This subject has no cards due for review
              </p>
            </div>
          </div>
        </header>
        <div className="p-6">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-12 text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                All caught up!
              </h3>
              <p className="mb-6 text-gray-600">
                This subject has no flashcards due for review right now.
              </p>
              <Button asChild>
                <Link href="/dashboard/review">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to All Reviews
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (sessionComplete && reviewSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/review">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reviews
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Review Complete
              </h1>
              <p className="text-gray-600">{subject?.title} session summary</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Completion Header */}
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  Excellent Work!
                </h2>
                <p className="mb-6 text-gray-600">
                  You&apos;ve completed your {subject?.title} review session.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {reviewSession.completedCards}
                    </div>
                    <div className="text-sm text-blue-800">Cards Reviewed</div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(accuracy)}%
                    </div>
                    <div className="text-sm text-green-800">Accuracy</div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {sessionDuration}m
                    </div>
                    <div className="text-sm text-purple-800">Time Spent</div>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(averageTimePerCard)}s
                    </div>
                    <div className="text-sm text-orange-800">Avg per Card</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ backgroundColor: subject?.color }}
                  />
                  {subject?.title} Review Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-lg font-semibold">
                      {reviewSession.correctAnswers}
                    </div>
                    <div className="text-sm text-gray-600">Correct Answers</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-lg font-semibold">
                      {reviewSession.completedCards -
                        reviewSession.correctAnswers}
                    </div>
                    <div className="text-sm text-gray-600">
                      Need More Practice
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-lg font-semibold">
                      {reviewSession.reviews.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/dashboard/review">
                  <Home className="mr-2 h-4 w-4" />
                  Back to All Reviews
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentCardIndex(0);
                  setShowAnswer(false);
                  setSessionComplete(false);
                  setReviewSession({
                    totalCards: dueCards.length,
                    completedCards: 0,
                    correctAnswers: 0,
                    startTime: new Date(),
                    reviews: [],
                  });
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Review Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/review">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                {subject && (
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                )}
                {subject?.title} Review
              </h1>
              <p className="text-gray-600">
                Card {currentCardIndex + 1} of {dueCards.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-semibold">
                {Math.round(progress)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Accuracy</div>
              <div className="text-lg font-semibold">
                {Math.round(accuracy)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Time</div>
              <div className="text-lg font-semibold">{sessionDuration}m</div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Current Card */}
          {currentCard && reviewSession && (
            <Card className="min-h-[500px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      Review #{currentCard.repetitionCount + 1}
                    </Badge>
                    <Badge variant="outline">
                      Ease Factor: {currentCard.easeFactor.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    Due {moment(currentCard.nextReviewDate).fromNow()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8 text-center">
                  {/* Question */}
                  <div>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Question:
                    </h3>
                    <p className="text-2xl leading-relaxed text-gray-800">
                      {currentCard.question}
                    </p>
                  </div>

                  {/* Answer (shown after clicking Show Answer) */}
                  {showAnswer && (
                    <div className="border-t pt-8">
                      <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Answer:
                      </h3>
                      <p className="text-xl leading-relaxed text-gray-700">
                        {currentCard.answer}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-8">
                    {!showAnswer ? (
                      <Button
                        onClick={() => setShowAnswer(true)}
                        size="lg"
                        className="cursor-pointer px-8"
                      >
                        Show Answer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-lg font-medium text-gray-900">
                          How well did you recall this?
                        </p>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                          {ratingOptions.map((option) => (
                            <Button
                              key={option.quality}
                              onClick={() => handleRating(option.quality)}
                              className={`${option.color} flex h-auto flex-col items-center gap-2 p-6 text-white`}
                              size="lg"
                            >
                              {option.icon}
                              <span className="font-semibold">
                                {option.label}
                              </span>
                              <span className="text-xs opacity-90">
                                {option.description}
                              </span>
                            </Button>
                          ))}
                        </div>
                        <div className="mx-auto max-w-2xl text-sm text-gray-500">
                          <p>
                            <strong>Again:</strong> You forgot completely •{" "}
                            <strong>Hard:</strong> You remembered with
                            difficulty • <strong>Good:</strong> You remembered
                            after thinking • <strong>Easy:</strong> You knew it
                            instantly
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cards Remaining
                </CardTitle>
                <Target className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reviewSession
                    ? dueCards.length - reviewSession.completedCards
                    : dueCards.length}
                </div>
                <p className="text-muted-foreground text-xs">
                  {reviewSession?.completedCards ?? 0} of {dueCards.length}{" "}
                  completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Correct Answers
                </CardTitle>
                <CheckCircle className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reviewSession?.correctAnswers ?? 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  {Math.round(accuracy)}% accuracy rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Session Time
                </CardTitle>
                <Clock className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessionDuration}m</div>
                <p className="text-muted-foreground text-xs">
                  {Math.round(averageTimePerCard)}s average per card
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
