"use client";

import FadeLoader from "react-spinners/FadeLoader";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Play } from "lucide-react";
import { api } from "@/trpc/react";
import SessionHeader from "@/components/session-header";
import moment from "moment";
import type { StudySession } from "@/types";
import { useRouter } from "next/navigation";

export default function StudySessionsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const router = useRouter();

  const { data: sessionData, isPending } =
    api.session.getAllSessions.useQuery();

  useEffect(() => {
    if (sessionData) {
      const startOfDay = moment().startOf("day").toDate();
      const endOfDay = moment().endOf("day").toDate();

      const todaySessions = sessionData.filter(
        (session) =>
          session.nextSessionDate >= startOfDay &&
          session.nextSessionDate <= endOfDay,
      );
      setSessions(todaySessions as StudySession[]);
    }
  }, [sessionData]);

  // Calculate status without side effects
  const calculateStatus = useCallback((session: StudySession) => {
    const now = new Date();
    if (session.status === "completed") return "completed";
    if (session.status === "in-progress") return "in-progress";
    if (now >= session.startTime && now <= session.endTime) return "due-now";
    if (now > session.endTime) return "overdue";
    return "upcoming";
  }, []);

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
        </div>
      </header>

      <div className="p-6">
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
                <CardTitle>Scheduled Sessions for today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-full space-y-4">
                  {sessions.length === 0 && (
                    <div className="flex w-full justify-center">
                      <p className="mx-auto text-lg text-gray-500">
                        All sessions completed for today! 🎊
                      </p>
                    </div>
                  )}
                  {sessions.map((session) => {
                    const status = calculateStatus(session);
                    // const status = session.status;
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
                                    {moment(session.nextSessionDate).format(
                                      "ddd, DD/MM/yyyy",
                                    )}
                                  </p>
                                  <p>
                                    {session.startTime.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}{" "}
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
      </div>
    </div>
  );
}
