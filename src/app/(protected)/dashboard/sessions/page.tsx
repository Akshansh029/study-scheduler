"use client";

import FadeLoader from "react-spinners/FadeLoader";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Play, Pause, Square, Brain, Clock, Target } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import SessionHeader from "@/components/session-header";
import moment from "moment";
import type { StudySession, SessionStatus } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudySessionsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const router = useRouter();

  const { data, isPending } = api.session.getAllSessions.useQuery();
  const trpcUtils = api.useUtils();
  const updateStatusMutation = api.session.updateStatus.useMutation({
    // Update the status of session quickly
    onMutate: async ({ sessionId, updatedStatus }) => {
      await trpcUtils.session.getAllSessions.cancel();
      const prev = trpcUtils.session.getAllSessions.getData();
      trpcUtils.session.getAllSessions.setData(undefined, (old) =>
        old?.map((s) =>
          s.id === sessionId ? { ...s, status: updatedStatus } : s,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      trpcUtils.session.getAllSessions.setData(undefined, ctx?.prev);
    },
    // Always refetch
    onSettled: () => {
      void trpcUtils.session.getAllSessions.invalidate();
      void trpcUtils.session.sessionStats.invalidate();
    },
  });

  useEffect(() => {
    if (data) {
      setSessions(data as StudySession[]);
    }
  }, [data]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && activeSession) {
      interval = setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeSession]);

  // Separate function to calculate status without side effects
  const calculateStatus = useCallback((session: StudySession) => {
    const now = new Date();
    if (session.status === "completed") return "completed";
    if (session.status === "in-progress") return "in-progress";
    if (now >= session.startTime && now <= session.endTime) return "due-now";
    if (now > session.endTime) return "overdue";
    return "upcoming";
  }, []);

  // Function to handle status updates
  const handleStatusUpdate = useCallback(
    async (sessionId: string, status: string) => {
      try {
        await updateStatusMutation.mutateAsync({
          sessionId,
          updatedStatus: status as SessionStatus,
        });
      } catch (error) {
        toast.error("Failed to update session status");
        console.error("Error updating session status:", error);
      }
    },
    [updateStatusMutation],
  );

  const startSession = (session: StudySession) => {
    setActiveSession(session);
    setSessions(
      sessions?.map((s) =>
        s.id === session.id ? { ...s, status: "in-progress" } : s,
      ),
    );

    // Update status in database
    void handleStatusUpdate(session.id, "in-progress");

    setSessionTimer(0);
    setIsTimerRunning(true);
  };

  const pauseSession = () => {
    setIsTimerRunning(false);
  };

  const resumeSession = () => {
    setIsTimerRunning(true);
  };

  const endSession = () => {
    if (activeSession) {
      setSessions(
        sessions.map((s) =>
          s.id === activeSession.id ? { ...s, status: "completed" } : s,
        ),
      );
      // Update status of the session
      void handleStatusUpdate(activeSession.id, "completed");
    }
    setActiveSession(null);
    setIsTimerRunning(false);
    setSessionTimer(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

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
        return <Badge variant="secondary">Upcoming</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          {activeSession && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Session Timer</div>
                <div className="font-mono text-xl font-bold">
                  {formatTime(sessionTimer)}
                </div>
              </div>
              <div className="flex gap-2">
                {isTimerRunning ? (
                  <Button variant="outline" onClick={pauseSession}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="outline" onClick={resumeSession}>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                )}
                <Button variant="destructive" onClick={endSession}>
                  <Square className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="p-6">
        {!activeSession ? (
          <>
            <SessionHeader />

            {/* Session List */}
            {isPending ? (
              <div className="px-auto flex h-64 items-center justify-center">
                <FadeLoader className="h-15 w-15" color="#a5a7a9" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.length === 0 && (
                      <div className="flex w-full justify-center">
                        <p className="mx-auto text-gray-500">
                          No sessions scheduled
                        </p>
                      </div>
                    )}
                    {sessions.map((session) => {
                      const status = calculateStatus(session);
                      return (
                        <Card
                          key={session.id}
                          className="py-4 transition-shadow hover:shadow-md"
                        >
                          <CardContent className="px-6 py-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{
                                    backgroundColor: session.subject.color,
                                  }}
                                />
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {session.title}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {session.subject.title}
                                  </p>
                                  <div className="mt-1 flex gap-2 text-sm text-gray-500">
                                    <p>
                                      {moment(session.startTime).format(
                                        "ddd, DD/MM/yyyy",
                                      )}
                                    </p>
                                    <p>
                                      {session.startTime.toLocaleTimeString(
                                        [],
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        },
                                      )}{" "}
                                      -{" "}
                                      {session.endTime.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {getStatusBadge(status)}
                                <Button
                                  // href={`/dashboard/sessions/${session.id}`}
                                  // onClick={() => startSession(session)}
                                  onClick={() => {
                                    router.push(
                                      `/dashboard/sessions/${session.id}`,
                                    );
                                  }}
                                  disabled={session.status === "completed"}
                                  className="flex cursor-pointer items-center rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Start Session
                                </Button>
                              </div>
                            </div>
                            {session.description && (
                              <div className="mt-3 border-t border-gray-100 pt-3">
                                <p className="text-xs text-gray-600">
                                  {session.description}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Active Session */
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Session Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: activeSession.subject.color }}
                    />
                    <div>
                      <CardTitle className="text-xl">
                        {activeSession.title}
                      </CardTitle>
                      <p className="text-gray-600">
                        {activeSession.subject.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-3xl font-bold text-indigo-600">
                      {formatTime(sessionTimer)}
                    </div>
                    <p className="text-sm text-gray-600">Study time</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Ambient Study Environment */}
            <Card className="min-h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <CardContent className="p-12">
                <div className="space-y-8 text-center">
                  {/* Animated Study Illustration */}
                  <div className="relative mx-auto mb-8 h-64 w-64">
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
                        className="h-24 w-24 animate-bounce text-indigo-600"
                        style={{ animationDuration: "3s" }}
                      />
                    </div>
                  </div>

                  {/* Encouraging Message */}
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-800">
                      You&apos;re in the Zone! 🧠
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
                        {activeSession.subject.title}
                      </div>
                      <div className="text-sm text-gray-600">Current Focus</div>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/60 p-6 backdrop-blur-sm">
                      <div className="mb-3 flex items-center justify-center">
                        <Brain className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        Active
                      </div>
                      <div className="text-sm text-gray-600">Learning Mode</div>
                    </div>
                  </div>

                  {/* Breathing Animation for Focus */}
                  <div className="mt-8">
                    <p className="mb-4 text-sm text-gray-600">
                      Take a deep breath and stay focused
                    </p>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-indigo-200">
                      <div className="h-8 w-8 animate-ping rounded-full bg-indigo-400 opacity-75"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <div className="mb-2 text-sm text-gray-600">
                      Session Duration
                    </div>
                    <div className="text-lg font-semibold">
                      {formatTime(sessionTimer)}
                    </div>
                  </div>
                  <div className="mx-6 h-8 w-px bg-gray-300"></div>
                  <div className="text-center">
                    <div className="mb-2 text-sm text-gray-600">Subject</div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: activeSession.subject.color }}
                      ></div>
                      {activeSession.subject.title}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
