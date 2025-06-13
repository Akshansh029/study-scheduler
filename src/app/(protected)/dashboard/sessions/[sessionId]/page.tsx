"use client";
import Confetti from "react-confetti-boom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { Brain, Clock, Pause, Play, Square, Target } from "lucide-react";
import moment from "moment";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Trophy, Home, CheckCircle } from "lucide-react";
import Link from "next/link";

const ActiveSessionPage = () => {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [sessionTimer, setSessionTimer] = useState<number>(() => {
    const storedTime = localStorage.getItem("sessionTimer");
    return storedTime ? parseInt(storedTime) : 0;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    const storedRunning = localStorage.getItem("isTimerRunning");
    return storedRunning ? JSON.parse(storedRunning) : true;
  });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [timeStudied, setTimeStudied] = useState(0);
  const [actualStartTimeDisplay, setActualStartTimeDisplay] = useState("");

  const { data: session, isLoading } = api.session.getSession.useQuery({
    sessionId,
  });

  const recordReviewMutation = api.session.updateStatus.useMutation({
    onError: () => {
      toast.error(`Failed to record session status`);
    },
  });

  const updateReviewDateMutation = api.session.updateReviewDate.useMutation();

  const updateStatusMutation = api.session.updateStatus.useMutation();
  useEffect(() => {
    updateStatusMutation.mutate({
      sessionId: session?.id ?? "",
      updatedStatus: "in-progress",
    });
  }, []);

  const actualStartTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    localStorage.removeItem("isTimerRunning");
    setIsTimerRunning(true);
  }, []);

  useEffect(() => {
    const storedStart = localStorage.getItem("actualStartTime");
    if (storedStart) {
      const parsed = new Date(storedStart);
      actualStartTimeRef.current = parsed;
      setActualStartTimeDisplay(moment(parsed).format("h:mm:ss A"));
    } else {
      const now = new Date();
      actualStartTimeRef.current = now;
      localStorage.setItem("actualStartTime", now.toISOString());
      setActualStartTimeDisplay(moment(now).format("h:mm:ss A"));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSessionTimer((prev) => {
          const updated = prev + 1;
          localStorage.setItem("sessionTimer", updated.toString());
          return updated;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    localStorage.setItem("isTimerRunning", JSON.stringify(isTimerRunning));
  }, [isTimerRunning]);

  const startTime = session?.startTime;
  const endTime = session?.endTime;
  const duration = moment(endTime).diff(moment(startTime), "seconds");

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const pauseSession = () => setIsTimerRunning(false);
  const resumeSession = () => setIsTimerRunning(true);

  const endSession = () => {
    if (!session) return;
    recordReviewMutation.mutate({ sessionId, updatedStatus: "completed" });

    updateReviewDateMutation.mutate({
      sessionId: session.id,
      startTime: session.startTime,
      recurrence: session.recurrence!,
    });

    const endTime = new Date();
    const startTime = actualStartTimeRef.current;
    if (startTime) {
      const diff = moment(endTime).diff(moment(startTime), "seconds");
      setTimeStudied(diff);
    }
    setIsTimerRunning(false);
    setSessionTimer(0);
    setSessionComplete(true);
    localStorage.removeItem("sessionTimer");
    localStorage.removeItem("actualStartTime");
    localStorage.removeItem("isTimerRunning");
  };

  return (
    <main className="min-h-screen bg-gray-50">
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
          {!sessionComplete && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Session Timer</div>
                <div className="font-mono text-xl font-bold">
                  {formatTime(sessionTimer)}
                </div>
              </div>
              <div className="flex gap-2">
                {isTimerRunning ? (
                  <Button
                    variant="outline"
                    onClick={pauseSession}
                    className="cursor-pointer"
                  >
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={resumeSession}
                    className="cursor-pointer"
                  >
                    <Play className="mr-2 h-4 w-4" /> Resume
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={endSession}
                  className="cursor-pointer"
                >
                  <Square className="mr-2 h-4 w-4" /> End Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="container mx-auto p-4">
        {isLoading ? (
          <div className="mt-32 flex h-full w-full flex-col items-center justify-center">
            <Brain className="mx-auto mb-4 h-16 w-16 animate-pulse text-gray-400" />
            <p className="text-gray-600">Loading your session...</p>
          </div>
        ) : sessionComplete ? (
          /* Session Complete UI */
          <div className="mx-auto max-w-full space-y-6">
            <Confetti
              mode="fall"
              particleCount={50}
              colors={["#ff577f", "#ff884b"]}
            />
            <Card>
              <CardContent className="px-8 py-6 text-center">
                <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  Session Complete!
                </h2>
                <p className="mb-6 text-gray-600">
                  Great work! You&apos;ve completed your{" "}
                  {session?.subject?.title} study session.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {moment.utc(timeStudied * 1000).format("HH:mm:ss")}
                    </div>
                    <div className="text-sm text-blue-800">Time Studied</div>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatTime(duration)} hrs
                    </div>
                    <div className="text-sm text-orange-800">
                      Planned Duration
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {session?.subject?.title}
                    </div>
                    <div className="text-sm text-green-800">
                      Subject Completed
                    </div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4 md:col-start-2">
                    <div className="text-2xl font-bold text-purple-600">
                      {moment(session?.startTime).format("MMM D, YYYY")}
                    </div>
                    <div className="text-sm text-purple-800">Session Date</div>
                  </div>
                </div>
                <div className="mt-8 flex justify-center gap-4">
                  <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                    <Link href="/dashboard/sessions">
                      <Home className="mr-2 h-4 w-4" />
                      Back to Sessions
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ backgroundColor: session?.subject?.color }}
                  />
                  {session?.title} - Session Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <div className="text-lg font-semibold">
                      Session Completed
                    </div>
                    <div className="text-sm text-gray-600">
                      Started: {actualStartTimeDisplay || "Not available"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Ended: {moment().format("h:mm:ss A")}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                    <div className="text-lg font-semibold">Study Duration</div>
                    <div className="text-sm text-gray-600">
                      Planned: {formatTime(duration)} hrs
                    </div>
                    <div className="text-sm text-gray-600">
                      Actual:{" "}
                      {moment.utc(timeStudied * 1000).format("HH:mm:ss")} hrs
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Active Session UI */
          <div className="mx-auto w-full space-y-6">
            <Card className="min-h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <CardContent className="px-6 py-2">
                <div className="space-y-8 text-center">
                  <div className="relative mx-auto mb-8 h-42 w-42">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20"></div>
                    <div
                      className="absolute inset-4 animate-pulse rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 opacity-30"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                      className="absolute inset-8 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 opacity-40"
                      style={{ animationDelay: "2s" }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain
                        className="h-10 w-10 animate-bounce text-indigo-600"
                        style={{ animationDuration: "3s" }}
                      />
                    </div>
                  </div>

                  {/* Encouraging Message */}
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-800">
                      Take a deep breath and stay focused! 🧠
                    </h2>
                    <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-600">
                      Deep focus mode activated. Your mind is absorbing
                      knowledge and building lasting memories. Keep up the
                      excellent work!
                    </p>
                  </div>

                  {/* Study Stats in Ambient Style */}
                  <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/20 bg-white/60 p-6 backdrop-blur-sm">
                      <div className="mb-3 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {formatTime(sessionTimer)}
                      </div>
                      <div className="text-sm text-gray-600">Time Invested</div>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/60 p-6 backdrop-blur-sm">
                      <div className="mb-3 flex items-center justify-center">
                        <Target className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {session?.title}
                      </div>
                      <div className="text-sm text-gray-600">Current Focus</div>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/60 p-6 backdrop-blur-sm">
                      <div className="mb-3 flex items-center justify-center">
                        <Brain className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {formatTime(duration)} hrs
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Duration
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
};

export default ActiveSessionPage;
