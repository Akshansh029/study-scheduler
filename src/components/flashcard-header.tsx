"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { BookOpen, Calendar, CheckCircle, BarChart3 } from "lucide-react";
import React from "react";

const FlashcardHeader = () => {
  const { data: stats, isLoading } = api.flashcard.stats.useQuery();
  const totalFlashcards = stats?.totalFlashcards ?? 0;
  const dueToday = stats?.dueToday ?? 0;
  const completedThisWeek = stats?.completedThisWeek ?? 0;
  const averageEaseFactor = stats?.averageEaseFactor ?? 0;
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Flashcards
          </CardTitle>
          <BookOpen className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "-" : totalFlashcards}
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
          <div className="text-2xl font-bold">
            {isLoading ? "-" : dueToday}{" "}
          </div>
          <p className="text-muted-foreground text-xs">Cards to review</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completed This Week
          </CardTitle>
          <CheckCircle className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "-" : completedThisWeek}
          </div>
          <p className="text-muted-foreground text-xs">Cards reviewed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Recall Score
          </CardTitle>
          <BarChart3 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "-" : averageEaseFactor}
          </div>
          <p className="text-muted-foreground text-xs">Ease factor</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashcardHeader;
