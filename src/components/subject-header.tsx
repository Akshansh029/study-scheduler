"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { BookOpen, Calendar, Target } from "lucide-react";
import React from "react";

const SubjectHeader = () => {
  const { data: subjects, isLoading } = api.subject.subjectStats.useQuery();
  const { data: cardStats, isLoading: isPending } =
    api.flashcard.stats.useQuery();
  const length = subjects?.subLength ?? 0;
  const dueCards = cardStats?.dueToday ?? 0;
  const totalCards = cardStats?.totalFlashcards ?? 0;

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
          <BookOpen className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "-" : length}</div>
          <p className="text-muted-foreground text-xs">Active study subjects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
          <Target className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isPending ? "-" : totalCards}
          </div>
          <p className="text-muted-foreground text-xs">Across all subjects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          <Calendar className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isPending ? "-" : dueCards}</div>
          <p className="text-muted-foreground text-xs">Cards to review</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
          <Target className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7 days</div>
          <p className="text-muted-foreground text-xs">Keep it up!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectHeader;
