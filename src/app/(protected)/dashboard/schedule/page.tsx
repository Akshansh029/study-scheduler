/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Play,
  Edit,
  Trash2,
  List,
} from "lucide-react";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
  type EventProps,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface StudySession {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  subjectId: string;
  subjectTitle: string;
  subjectColor: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  description?: string;
  status: "scheduled" | "in-progress" | "completed";
}

type RecType = "none" | "daily" | "weekly" | "monthly";

interface Subject {
  id: string;
  title: string;
  color: string;
}

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: StudySession;
};

const subjects: Subject[] = [
  { id: "1", title: "Physics", color: "#2563EB" },
  { id: "2", title: "Mathematics", color: "#059669" },
  { id: "3", title: "Chemistry", color: "#7C3AED" },
  { id: "4", title: "Biology", color: "#DC2626" },
];

const localizer = momentLocalizer(moment);

export default function SchedulePage() {
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: "1",
      title: "Quantum Mechanics Review",
      startTime: new Date(2024, 11, 8, 9, 0),
      endTime: new Date(2024, 11, 8, 10, 30),
      subjectId: "1",
      subjectTitle: "Physics",
      subjectColor: "#2563EB",
      recurrence: "weekly",
      description: "Review quantum mechanics concepts and practice problems",
      status: "scheduled",
    },
    {
      id: "2",
      title: "Calculus Practice",
      startTime: new Date(2024, 11, 8, 14, 0),
      endTime: new Date(2024, 11, 8, 15, 30),
      subjectId: "2",
      subjectTitle: "Mathematics",
      subjectColor: "#059669",
      recurrence: "daily",
      description: "Practice integration and differentiation problems",
      status: "scheduled",
    },
    {
      id: "3",
      title: "Organic Chemistry",
      startTime: new Date(2024, 11, 9, 16, 30),
      endTime: new Date(2024, 11, 9, 18, 0),
      subjectId: "3",
      subjectTitle: "Chemistry",
      subjectColor: "#7C3AED",
      recurrence: "none",
      description: "Study reaction mechanisms and synthesis pathways",
      status: "scheduled",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(
    null,
  );
  const [form, setForm] = useState<{
    title: string;
    subjectId: string;
    startTime: string;
    endTime: string;
    recurrence: StudySession["recurrence"];
    description: string;
  }>({
    title: "",
    subjectId: "",
    startTime: "",
    endTime: "",
    recurrence: "none",
    description: "",
  });

  // Sync window resize for calendar render
  useEffect(() => {
    const timer = setTimeout(
      () => window.dispatchEvent(new Event("resize")),
      100,
    );
    return () => clearTimeout(timer);
  }, []);

  // Prepare events for BigCalendar
  const calendarEvents = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    start: s.startTime,
    end: s.endTime,
    resource: s,
  }));

  // Style each event based on its subject color
  const eventPropGetter = (
    event: CalendarEvent,
    start: Date,
    end: Date,
    isSelected: boolean,
  ) => ({
    style: {
      backgroundColor: event.resource.subjectColor,
      borderRadius: 4,
      color: "white",
      border: 0,
    },
  });

  function openCreate() {
    setEditingSession(null);
    setForm({
      title: "",
      subjectId: "",
      startTime: "",
      endTime: "",
      recurrence: "none",
      description: "",
    });
    setIsDialogOpen(true);
  }

  function openEdit(session: StudySession) {
    setEditingSession(session);
    setForm({
      title: session.title,
      subjectId: session.subjectId,
      startTime: moment(session.startTime).format("YYYY-MM-DDTHH:mm"),
      endTime: moment(session.endTime).format("YYYY-MM-DDTHH:mm"),
      recurrence: session.recurrence ?? "none",
      description: session.description ?? "",
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setIsDialogOpen(false);
    setEditingSession(null);
    setForm({
      title: "",
      subjectId: "",
      startTime: "",
      endTime: "",
      recurrence: "none",
      description: "",
    });
  }

  function handleSave() {
    if (!form.title || !form.subjectId || !form.startTime || !form.endTime)
      return;

    const subject = subjects.find((s) => s.id === form.subjectId)!;
    const newSession: StudySession = {
      id: editingSession ? editingSession.id : Date.now().toString(),
      title: form.title,
      subjectId: form.subjectId,
      subjectTitle: subject.title,
      subjectColor: subject.color,
      startTime: new Date(form.startTime),
      endTime: new Date(form.endTime),
      recurrence: form.recurrence,
      description: form.description,
      status: editingSession?.status ?? "scheduled",
    };

    setSessions((prev) =>
      editingSession
        ? prev.map((s) => (s.id === editingSession.id ? newSession : s))
        : [...prev, newSession],
    );

    resetForm();
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this session?")) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const getStatusBadge = (status: StudySession["status"]) => {
    if (status === "in-progress")
      return <Badge className="bg-orange-500">In Progress</Badge>;
    if (status === "completed")
      return <Badge className="bg-green-500">Completed</Badge>;
    return <Badge variant="secondary">Scheduled</Badge>;
  };

  const getRecurrenceBadge = (rec: StudySession["recurrence"]) =>
    rec && rec !== "none" ? (
      <Badge variant="outline" className="text-xs">
        {rec}
      </Badge>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + Dialog */}
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">Schedule</h1>
            <p className="text-gray-600">
              Manage your study sessions and time blocks
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => !o && resetForm()}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? "Edit Session" : "Create New Session"}
              </DialogTitle>
              <DialogDescription>
                {editingSession
                  ? "Update your study session details."
                  : "Schedule a new study session."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Subject</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) => setForm({ ...form, subjectId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Recurrence</Label>
                <Select
                  value={form.recurrence}
                  onValueChange={(v) =>
                    setForm({ ...form, recurrence: v as RecType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingSession ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Today&apos;s Sessions</CardTitle>
            <CalendarIcon className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                sessions.filter((s) =>
                  moment(s.startTime).isSame(new Date(), "day"),
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>This Week</CardTitle>
            <CalendarDays className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* compute weekly count */}
              {
                sessions.filter((s) =>
                  moment(s.startTime).isSame(new Date(), "week"),
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Study Time</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Completion Rate</CardTitle>
            <Play className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar / Table */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Study Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[600px]">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                defaultView={Views.WEEK}
                eventPropGetter={eventPropGetter}
                onSelectEvent={(e) => openEdit(e.resource as StudySession)}
                popup
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
