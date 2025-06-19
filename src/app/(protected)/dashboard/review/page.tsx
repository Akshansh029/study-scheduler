"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Play, Trophy } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import TopHeader from "@/components/TopHeader";
import FadeLoader from "react-spinners/FadeLoader";
import ReviewHeader from "@/components/review-header";
import type { SubjectWithCards } from "@/types";
import { getEarliestNextReviewDate, isSubjectOverdue } from "@/utils/utils";

export default function ReviewPage() {
  const [subjectStats, setSubjectStats] = useState<SubjectWithCards[]>([]);
  const [isRouting, setIsRouting] = useState(false);

  const { data: subjectWithCards, isLoading } =
    api.review.getSubjectWithCards.useQuery();
  const { data: cardStats } = api.flashcard.stats.useQuery();

  useEffect(() => {
    if (subjectWithCards) {
      setSubjectStats(subjectWithCards);
    }
  }, [subjectWithCards]);

  const dueCards = cardStats?.dueToday ?? 0;
  const totalCards = cardStats?.totalFlashcards ?? 0;

  // subject with due cards
  const subjectsWithDueCards = subjectWithCards?.filter((subject) =>
    isSubjectOverdue(subject),
  );
  const subjectsWithoutDueCards = subjectWithCards?.filter(
    (subject) => !isSubjectOverdue(subject),
  );

  if (dueCards === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopHeader
          title="Review"
          subtitle="Active recall practice with spaced repetition"
        />

        <div className="p-4">
          <ReviewHeader />
        </div>

        <div className="p-2">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-6 text-center">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader
        title="Review"
        subtitle="Active recall practice with spaced repetition"
      />

      <div className="p-6">
        <ReviewHeader />
        {isLoading ? (
          <div className="px-auto flex h-64 items-center justify-center">
            <FadeLoader className="h-15 w-15" color="#a5a7a9" />
          </div>
        ) : (
          <Card>
            {/* Subject Review List */}
            <CardHeader>
              <CardTitle>Subjects Ready for Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectStats?.length === 0 && !isLoading ? (
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
                  <>
                    {subjectsWithDueCards?.map((stat) => (
                      <Card
                        key={stat.id}
                        className="rounded-sm px-4 py-0 transition-shadow hover:shadow-md"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className="h-6 w-6 rounded-full"
                                style={{ backgroundColor: stat.color }}
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {stat.title}
                                </h3>
                                <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                                  <span>
                                    {stat.flashcards.length} total cards
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  {isSubjectOverdue(stat) && (
                                    <Badge
                                      variant="destructive"
                                      className="text-sm"
                                    >
                                      Overdue
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  Next: {getEarliestNextReviewDate(stat)}
                                </div>
                              </div>
                              <Button
                                asChild
                                className="bg-indigo-600 hover:bg-indigo-700"
                                disabled={isRouting}
                                onClick={() => setIsRouting(true)}
                              >
                                <Link href={`/dashboard/review/${stat.id}`}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Start Review
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {subjectsWithoutDueCards?.map((stat) => (
                      <Card
                        key={stat.id}
                        className="rounded-sm px-4 py-0 transition-shadow hover:shadow-md"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className="h-6 w-6 rounded-full"
                                style={{ backgroundColor: stat.color }}
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {stat.title}
                                </h3>
                                <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                                  <span>
                                    {stat.flashcards.length} total cards
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  {isSubjectOverdue(stat) && (
                                    <Badge
                                      variant="destructive"
                                      className="text-sm"
                                    >
                                      Overdue
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  Next: {getEarliestNextReviewDate(stat)}
                                </div>
                              </div>
                              <Button
                                asChild
                                className="bg-indigo-600 hover:bg-indigo-700"
                              >
                                <Link href={`/dashboard/review/${stat.id}`}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Start Review
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
