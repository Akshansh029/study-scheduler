"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Timer, Brain, Target } from "lucide-react";
import { api } from "@/trpc/react";

const SessionHeader = () => {
  const { data, isLoading } = api.session.sessionStats.useQuery();
  const hours = data?.hours ?? 0;
  const minutes = data?.minutes ?? 0;
  const sessionLength = data?.todayCount ?? 0;
  const completedSessions = data?.completedSessions ?? 0;

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today&apos;s Sessions
          </CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "-" : sessionLength}
          </div>
          <p className="text-muted-foreground text-xs">Scheduled for today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Time</CardTitle>
          <Timer className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "-" : hours}h {isLoading ? "-" : minutes}mins
          </div>
          <p className="text-muted-foreground text-xs">Planned for today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Sessions Completed
          </CardTitle>
          <Brain className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "-" : completedSessions}
          </div>
          <p className="text-muted-foreground text-xs">For today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <Target className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "-" : data?.completedSessionsPercentage}%
          </div>
          <p className="text-muted-foreground text-xs">Today</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionHeader;
