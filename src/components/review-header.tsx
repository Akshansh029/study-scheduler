"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, Clock, Target } from "lucide-react";
import { api } from "@/trpc/react";

const ReviewHeader = () => {
  const { data: subjectWithCards, isLoading } =
    api.review.getSubjectCards.useQuery();

  const totalDue = subjectWithCards?.reduce(
    (sum, subject) => sum + subject.flashcards.length,
    0,
  );

  const totalCards = subjectWithCards?.reduce(
    (sum, subject) => sum + subject.flashcards.length,
    0,
  );

  const subjectsWithDueCards = subjectWithCards?.filter(
    (subject) => subject.flashcards.length > 0,
  );
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Due Today</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "-" : totalDue}</div>
          <p className="text-muted-foreground text-xs">
            Cards ready for review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subjects Active</CardTitle>
          <BookOpen className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "-" : subjectsWithDueCards?.length}
          </div>
          <p className="text-muted-foreground text-xs">Need attention today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
          <Target className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "-" : totalCards}
          </div>
          <p className="text-muted-foreground text-xs">Across all subjects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
          <CheckCircle className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7 days</div>
          <p className="text-muted-foreground text-xs">Keep it going!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewHeader;
