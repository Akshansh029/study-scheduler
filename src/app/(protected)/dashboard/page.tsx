"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  TrendingUp,
  BookOpen,
  Plus,
  CheckCircle2,
  Trash2,
  NotepadText,
  Check,
} from "lucide-react";
import type { StudySession, Todo } from "@/types";
import TopHeader from "@/components/TopHeader";
import { api } from "@/trpc/react";
import moment from "moment";
import { getEarliestNextReviewDate, isSubjectOverdue } from "utils/utils";
import { toast } from "sonner";
import useRefetch from "hooks/use-refetch";
import FadeLoader from "react-spinners/FadeLoader";

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [allSessions, setAllSessions] = useState<StudySession[]>();

  const refetch = useRefetch();

  // All queries and mutations
  const { data: sessionStats } = api.session.sessionStats.useQuery();
  const { data: sessionData, isLoading } =
    api.session.getAllSessions.useQuery();
  const { data: cardStats } = api.flashcard.stats.useQuery();
  const { data: activeSubjects, isLoading: isSubjectLoading } =
    api.review.getSubjectWithCards.useQuery();
  const fetchTodoMutation = api.todo.getAllTodos.useQuery();
  const allTodos = fetchTodoMutation.data;
  const createTodoMutation = api.todo.createTodo.useMutation({
    onSuccess: () => {
      void refetch();
      setNewTodo("");
    },
    onError: () => {
      toast.error("Failed to create todo");
    },
  });
  const toggleTodoMutation = api.todo.toggleTodo.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onError: () => {
      toast.error("Failed to update todo");
    },
  });
  const deleteTodoMutation = api.todo.deleteTodo.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onError: () => {
      toast.error("Failed to delete todo");
    },
  });

  const completedSessionsPercentage =
    sessionStats?.completedSessionsPercentage ?? 0;
  const completedWeeklyPercentage =
    sessionStats?.completedWeekSessionsPercentage ?? 0;
  const dueTodayCards = cardStats?.dueToday ?? 0;
  const totalCards = cardStats?.totalFlashcards ?? 0;

  useEffect(() => {
    if (sessionData) {
      const startOfDay = moment().startOf("day").toDate();
      const endOfDay = moment().endOf("day").toDate();

      const todaySessions = sessionData.filter(
        (session) =>
          session.nextSessionDate >= startOfDay &&
          session.nextSessionDate <= endOfDay,
      );
      setAllSessions(todaySessions as StudySession[]);
    }
    if (allTodos) {
      setTodos(allTodos as Todo[]);
    }
  }, [sessionData, allTodos]);

  const subjectsWithDueCards = activeSubjects?.filter((subject) =>
    isSubjectOverdue(subject),
  );

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
        return <Badge variant="default">Upcoming</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const calculateStatus = useCallback((session: StudySession) => {
    const now = new Date();
    if (session.status === "completed") return "completed";
    if (session.status === "in-progress") return "in-progress";
    if (now >= session.startTime && now <= session.endTime) return "due-now";
    if (now > session.endTime) return "overdue";
    return "upcoming";
  }, []);

  const addTodo = () => {
    if (newTodo) {
      createTodoMutation.mutate({
        text: newTodo,
      });
    } else {
      toast.error("Todo text cannot be empty");
    }
  };

  const toggleTodo = (id: string) => {
    toggleTodoMutation.mutate({
      todoId: id,
    });
  };

  const deleteTodo = (id: string) => {
    deleteTodoMutation.mutate({
      todoId: id,
    });
  };

  const completedTodos = todos.filter((todo) => todo.completed).length;
  const totalTodos = todos.length;
  const completionRate =
    totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <TopHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your study overview."
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's Schedule */}
          <Card className="max-h-[445px] lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s Schedule
              </CardTitle>
              <CardDescription>
                Your planned study sessions and reviews for today
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[385px] space-y-4 overflow-auto">
              {isLoading ? (
                <div className="mt-[110px] flex items-center justify-center">
                  <FadeLoader className="h-15 w-15" color="#a5a7a9" />
                </div>
              ) : (
                <>
                  {(subjectsWithDueCards?.length ?? 0) <= 0 &&
                  (allSessions?.length ?? 0) <= 0 ? (
                    <div className="flex h-full w-full items-center justify-center gap-2">
                      <p className="text-base text-gray-600">
                        No session or review for today
                      </p>
                      <Check size={25} className="text-gray-600" />
                    </div>
                  ) : (
                    <>
                      {(allSessions?.length ?? 0) > 0 &&
                        allSessions?.map((session, key) => {
                          return (
                            <div
                              className="flex items-center justify-between rounded-lg border-l-4 p-4"
                              style={{
                                borderColor: session.subject.color,
                                backgroundColor: `${session.subject.color}20`,
                              }}
                              key={key}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                                  style={{
                                    backgroundColor: `${session.subject.color}40`,
                                  }}
                                >
                                  <BookOpen
                                    className="h-5 w-5"
                                    style={{ color: session.subject.color }}
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    {session.title} Session
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {session.subject.title}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {moment(session.nextSessionDate).format(
                                    "hh:mm A",
                                  )}
                                </p>
                                {getStatusBadge(calculateStatus(session))}
                              </div>
                            </div>
                          );
                        })}
                      {(subjectsWithDueCards?.length ?? 0) > 0 &&
                        subjectsWithDueCards?.map((subject, key) => {
                          return (
                            <div
                              className="flex items-center justify-between rounded-lg border-l-4 p-4"
                              style={{
                                borderColor: subject.color,
                                backgroundColor: `${subject.color}20`,
                              }}
                              key={key}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                                  style={{
                                    backgroundColor: `${subject.color}40`,
                                  }}
                                >
                                  <NotepadText
                                    className="h-5 w-5"
                                    style={{ color: subject.color }}
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    {subject.title} Review
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {subject.title}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {moment(
                                    getEarliestNextReviewDate(subject),
                                  ).format("hh:mm A")}
                                </p>
                                {isSubjectOverdue(subject) ? (
                                  <Badge variant="destructive">Overdue</Badge>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="h-[445px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Today&apos;s Progress</span>
                  <span>{completedSessionsPercentage}%</span>
                </div>
                <Progress value={completedSessionsPercentage} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Weekly Progress</span>
                  <span>{completedWeeklyPercentage}%</span>
                </div>
                <Progress value={completedWeeklyPercentage} className="h-2" />
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Cards Due Today</span>
                  <span>{dueTodayCards}</span>
                </div>
                <Progress
                  value={Math.floor(
                    ((totalCards - dueTodayCards) / totalCards) * 100,
                  )}
                  className="h-2"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3 font-medium">Active Subjects</h4>
                <div className="max-h-[120px] space-y-2 overflow-auto">
                  {(activeSubjects?.length ?? 0) > 0 && !isSubjectLoading ? (
                    activeSubjects?.map((subject, index) => {
                      return (
                        <div
                          className="flex items-center justify-between"
                          key={index}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            ></div>
                            <span className="text-sm">{subject.title}</span>
                          </div>
                          <Badge variant="secondary">
                            {subject.flashcards.length} cards
                          </Badge>
                        </div>
                      );
                    })
                  ) : isSubjectLoading ? (
                    <p className="text-muted-foreground text-sm">
                      Loading active subjects...
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No active subjects
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* To-Do List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Study To-Do List
            </CardTitle>
            <CardDescription>
              Keep track of your study tasks and assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add new todo */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  className="flex-1"
                />
                <Button
                  onClick={addTodo}
                  disabled={createTodoMutation.status === "pending"}
                  className="cursor-pointer"
                >
                  <Plus className="h-2 w-2" />
                </Button>
              </div>

              {fetchTodoMutation.status === "pending" ? (
                <div className="mt-10 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    Fetching you todos...
                  </p>
                </div>
              ) : (
                <>
                  {/* Progress indicator */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {completedTodos} of {totalTodos} tasks completed
                    </span>
                    <span>{Math.round(completionRate)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />

                  {todos.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      <CheckCircle2 className="mx-auto mb-3 h-12 w-12 opacity-50" />
                      <p>No tasks yet. Add one above to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Todo items */}
                      {todos.map((todo) => (
                        <div
                          key={todo.id}
                          className={`flex items-center gap-3 rounded-lg border p-3 ${
                            todo.completed
                              ? "bg-gray-50 opacity-75"
                              : "bg-white"
                          }`}
                        >
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => toggleTodo(todo.id)}
                          />
                          <div className="flex-1">
                            <span
                              className={`${todo.completed ? "text-gray-500 line-through" : "text-gray-900"}`}
                            >
                              {todo.text}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTodo(todo.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="rounded-lg bg-blue-50 px-5 py-3">
                        <p className="text-sm text-blue-500">
                          <span className="text-sm font-semibold">
                            Suggestion:
                          </span>{" "}
                          It&apos;s a good practice to delete all your completed
                          todos at the end of the day
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
