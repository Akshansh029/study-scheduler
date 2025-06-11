"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Brain,
  Clock,
  Calendar,
  Play,
  BookOpen,
  Target,
  CheckCircle,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import moment from "moment";

// Types
interface Subject {
  id: string;
  title: string;
  color: string;
}

interface SubjectReviewStats {
  subject: Subject;
  dueCount: number;
  overdueCount: number;
  totalCards: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

// Mock data for development - replace with tRPC calls
const mockSubjectStats: SubjectReviewStats[] = [
  {
    subject: { id: "1", title: "Physics", color: "#2563EB" },
    dueCount: 8,
    overdueCount: 3,
    totalCards: 45,
    lastReviewed: new Date(Date.now() - 86400000), // Yesterday
    nextReview: new Date(),
  },
  {
    subject: { id: "2", title: "Mathematics", color: "#059669" },
    dueCount: 12,
    overdueCount: 5,
    totalCards: 67,
    lastReviewed: new Date(Date.now() - 2 * 86400000), // 2 days ago
    nextReview: new Date(),
  },
  {
    subject: { id: "3", title: "Chemistry", color: "#7C3AED" },
    dueCount: 6,
    overdueCount: 1,
    totalCards: 38,
    lastReviewed: new Date(Date.now() - 86400000), // Yesterday
    nextReview: new Date(Date.now() + 86400000), // Tomorrow
  },
  {
    subject: { id: "4", title: "Biology", color: "#DC2626" },
    dueCount: 4,
    overdueCount: 0,
    totalCards: 29,
    lastReviewed: new Date(),
    nextReview: new Date(Date.now() + 2 * 86400000), // Day after tomorrow
  },
];

export default function ReviewPage() {
  const [subjectStats] = useState<SubjectReviewStats[]>(mockSubjectStats);

  // Calculate overall stats
  const totalDue = subjectStats.reduce((sum, stat) => sum + stat.dueCount, 0);
  const totalOverdue = subjectStats.reduce(
    (sum, stat) => sum + stat.overdueCount,
    0,
  );
  const totalCards = subjectStats.reduce(
    (sum, stat) => sum + stat.totalCards,
    0,
  );
  const subjectsWithDueCards = subjectStats.filter((stat) => stat.dueCount > 0);

  // Filter subjects that have cards due for review
  const subjectsNeedingReview = subjectStats.filter(
    (stat) => stat.dueCount > 0,
  );

  if (totalDue === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review</h1>
              <p className="text-gray-600">
                Active recall practice with spaced repetition
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-12 text-center">
              <Trophy className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                All caught up!
              </h3>
              <p className="mb-6 text-gray-600">
                You have no flashcards due for review today. Great job staying
                on top of your studies!
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="font-semibold text-blue-900">
                      Next Review
                    </div>
                    <div className="text-blue-700">Tomorrow</div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="font-semibold text-green-900">Streak</div>
                    <div className="text-green-700">7 days</div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4">
                    <div className="font-semibold text-purple-900">
                      Total Cards
                    </div>
                    <div className="text-purple-700">{totalCards}</div>
                  </div>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Brain className="mr-2 h-4 w-4" />
                  Practice Random Cards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review</h1>
              <p className="text-gray-600">
                Choose a subject to start your review session
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-gray-600">Cards Due</div>
              <div className="text-lg font-semibold">{totalDue}</div>
            </div>
            {totalOverdue > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Overdue</div>
                <div className="text-lg font-semibold text-red-600">
                  {totalOverdue}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Due Today
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDue}</div>
              <p className="text-muted-foreground text-xs">
                Cards ready for review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subjects Active
              </CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subjectsWithDueCards.length}
              </div>
              <p className="text-muted-foreground text-xs">
                Need attention today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <Target className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCards}</div>
              <p className="text-muted-foreground text-xs">
                Across all subjects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Study Streak
              </CardTitle>
              <CheckCircle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 days</div>
              <p className="text-muted-foreground text-xs">Keep it going!</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Review List */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects Ready for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectsNeedingReview.length === 0 ? (
                <div className="py-12 text-center">
                  <Brain className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No reviews needed
                  </h3>
                  <p className="text-gray-600">
                    All your flashcards are up to date!
                  </p>
                </div>
              ) : (
                subjectsNeedingReview.map((stat) => (
                  <Card
                    key={stat.subject.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: stat.subject.color }}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {stat.subject.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{stat.totalCards} total cards</span>
                              {stat.lastReviewed && (
                                <span>
                                  Last reviewed{" "}
                                  {moment(stat.lastReviewed).fromNow()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  stat.overdueCount > 0
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-sm"
                              >
                                {stat.dueCount} due
                              </Badge>
                              {stat.overdueCount > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-sm"
                                >
                                  {stat.overdueCount} overdue
                                </Badge>
                              )}
                            </div>
                            {stat.nextReview && (
                              <div className="mt-1 text-xs text-gray-500">
                                Next: {moment(stat.nextReview).calendar()}
                              </div>
                            )}
                          </div>
                          <Button
                            asChild
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Link href={`/dashboard/review/${stat.subject.id}`}>
                              <Play className="mr-2 h-4 w-4" />
                              Start Review
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/flashcards">
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Flashcards
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
