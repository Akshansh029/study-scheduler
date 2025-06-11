"use client";
import { useState } from "react";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Calendar,
  Target,
  TrendingUp,
  BookOpen,
  Brain,
  Plus,
  CheckCircle2,
  Trash2,
  Flame,
  Award,
} from "lucide-react";
import type { TodoItem } from "@/types";

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
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back! Here&apos;s your study overview.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Flame className="h-4 w-4" />7 day streak
            </Badge>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </div>
        </div>
      </header>

      <div className="space-y-6 p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Reviews
              </CardTitle>
              <Brain className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-muted-foreground text-xs">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Study Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 days</div>
              <p className="text-muted-foreground text-xs">Keep it up!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cards Mastered
              </CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-muted-foreground text-xs">+23 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Accuracy Rate
              </CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-muted-foreground text-xs">
                +5% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s Schedule
              </CardTitle>
              <CardDescription>
                Your planned study sessions and reviews for today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Physics Review</h4>
                    <p className="text-sm text-gray-600">
                      Quantum Mechanics - 24 cards due
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">9:00 AM</p>
                  <Badge variant="secondary">Due Now</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Mathematics Study</h4>
                    <p className="text-sm text-gray-600">
                      Calculus - Scheduled session
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">2:00 PM</p>
                  <Badge variant="outline">Upcoming</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Chemistry Review</h4>
                    <p className="text-sm text-gray-600">
                      Organic Chemistry - 18 cards due
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">4:30 PM</p>
                  <Badge variant="outline">Upcoming</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
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
                  <span>73%</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Cards Due Today</span>
                  <span>42</span>
                </div>
                <Progress value={60} className="h-2" />
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Physics</span>
                    </div>
                    <Badge variant="secondary">156 cards</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Mathematics</span>
                    </div>
                    <Badge variant="secondary">89 cards</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Chemistry</span>
                    </div>
                    <Badge variant="secondary">124 cards</Badge>
                  </div>
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
