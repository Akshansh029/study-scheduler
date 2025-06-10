"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CalendarIcon, Clock, Play } from "lucide-react";
import { api } from "@/trpc/react";

const ScheduleHeader = () => {
  const { data } = api.session.sessionStats.useQuery();
  const todayCount = data?.todayCount ?? 0;
  const weekCount = data?.weekCount ?? 0;
  const weekHrs = data?.weekHrs ?? 0;
  const weekMins = data?.weekMins ?? 0;
  const completedWeekSessionsPercentage =
    data?.completedWeekSessionsPercentage ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex justify-between pb-2">
          <CardTitle>Today&apos;s sessions</CardTitle>
          <CalendarIcon className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayCount}</div>
          <p className="text-muted-foreground text-xs">Scheduled for today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex justify-between pb-2">
          <CardTitle>This Week</CardTitle>
          <CalendarDays className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weekCount}</div>
          <p className="text-muted-foreground text-xs">
            Scheduled for the week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex justify-between pb-2">
          <CardTitle>Study Time</CardTitle>
          <Clock className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {weekHrs}h {weekMins}mins
          </div>
          <p className="text-muted-foreground text-xs">Planned for the week</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex justify-between pb-2">
          <CardTitle>Completion</CardTitle>
          <Play className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {completedWeekSessionsPercentage}%
          </div>
          <p className="text-muted-foreground text-xs">Week</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleHeader;
