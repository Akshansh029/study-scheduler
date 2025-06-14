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
} from "lucide-react";
import type { StudySession, SubjectWithCards, TodoItem } from "@/types";
import TopHeader from "@/components/TopHeader";
import { api } from "@/trpc/react";
import moment from "moment";
import { getEarliestNextReviewDate, isSubjectOverdue } from "utils/utils";

export default function DashboardPage() {
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: "1",
      text: "Review Physics flashcards",
      completed: false,
      priority: "high",
    },
    {
      id: "2",
      text: "Complete Math homework",
      completed: true,
      priority: "medium",
    },
    {
      id: "3",
      text: "Read Chemistry chapter 5",
      completed: false,
      priority: "low",
    },
  ]);
  const [newTodo, setNewTodo] = useState("");
  const [allSessions, setAllSessions] = useState<StudySession[]>();

  const { data: sessionStats } = api.session.sessionStats.useQuery();
  const { data: sessionData } = api.session.getAllSessions.useQuery();
  const { data: cardStats } = api.flashcard.stats.useQuery();
  const { data: activeSubjects } = api.review.getSubjectWithCards.useQuery();
  const completedSessionsPercentage =
    sessionStats?.completedSessionsPercentage ?? 0;
  const dueTodayCards = cardStats?.dueToday ?? 0;
  const todayCards = cardStats?.totalFlashcards ?? 0;

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
  }, [sessionData]);

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
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo,
        completed: false,
        priority: "medium",
      };
      setTodos([...todos, todo]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
                          {moment(session.nextSessionDate).format("hh:mm A")}
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
                          {moment(getEarliestNextReviewDate(subject)).format(
                            "hh:mm A",
                          )}
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
                  <span>Weekly Progress</span>
                  <span>{completedSessionsPercentage}%</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Cards Due Today</span>
                  <span>{dueTodayCards}</span>
                </div>
                <Progress
                  value={Math.floor(
                    ((todayCards - dueTodayCards) / todayCards) * 100,
                  )}
                  className="h-2"
                />
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Study Time Today</span>
                  <span>2.5h / 4h</span>
                </div>
                <Progress value={62.5} className="h-2" />
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3 font-medium">Active Subjects</h4>
                <div className="max-h-[120px] space-y-2 overflow-auto">
                  {(activeSubjects?.length ?? 0) > 0 ? (
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
                <Button onClick={addTodo}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {completedTodos} of {totalTodos} tasks completed
                </span>
                <span>{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />

              {/* Todo items */}
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      todo.completed ? "bg-gray-50 opacity-75" : "bg-white"
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
                    <Badge
                      variant="secondary"
                      className={getPriorityColor(todo.priority)}
                    >
                      {todo.priority}
                    </Badge>
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
              </div>

              {todos.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>No tasks yet. Add one above to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
