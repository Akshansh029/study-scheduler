"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "hooks/use-refetch";

const localizer = momentLocalizer(moment);

interface StudySession {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  subjectId: string;
  subject: { id: string; title: string; color: string };
  recurrence?: string | null;
  description?: string | null;
  status: "upcoming" | "in-progress" | "completed" | "due-now" | "overdue";
}

type RecType = "none" | "daily" | "weekly" | "monthly";

interface FormState {
  title: string;
  subjectId: string;
  startTime: string;
  endTime: string;
  recurrence: RecType;
  description: string;
}

export default function SchedulePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StudySession | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    subjectId: "",
    startTime: "",
    endTime: "",
    recurrence: "none",
    description: "",
  });

  const refetch = useRefetch();

  const subjects = api.subject.getSubjects.useQuery().data;
  const { data: rawSessions } = api.session.getAllSessions.useQuery();
  const createMutation = api.session.createSession.useMutation({
    onSuccess: () => {
      toast.success("Session created");
      void refetch();
      closeDialog();
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    return () => clearTimeout(t);
  }, []);

  // Safely default to empty array:
  const sessions: StudySession[] = (rawSessions ?? [])
    .filter((s) => typeof s.subjectId === "string" && s.subjectId && s.subject)
    .map((s) => ({
      id: s.id,
      title: s.title,
      startTime: new Date(s.startTime),
      endTime: new Date(s.endTime),
      subjectId: s.subjectId!,
      subject: s.subject as { id: string; title: string; color: string },
      recurrence: s.recurrence,
      description: s.description,
      status: "upcoming",
    }));

  // Prepare for calendar
  type CalEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: StudySession;
  };
  const calendarEvents: CalEvent[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    start: s.startTime,
    end: s.endTime,
    resource: s,
  }));

  // Correct signature:
  const eventPropGetter = (
    event: CalEvent,
    start: Date,
    end: Date,
    isSelected: boolean,
  ) => ({
    style: {
      backgroundColor: event.resource.subject.color,
      borderRadius: 4,
      color: "white",
      border: 0,
    },
  });

  function openCreate() {
    setEditing(null);
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

  function openEdit(sess: StudySession) {
    setEditing(sess);
    setForm({
      title: sess.title,
      subjectId: sess.subjectId,
      startTime: moment(sess.startTime).format("YYYY-MM-DDTHH:mm"),
      endTime: moment(sess.endTime).format("YYYY-MM-DDTHH:mm"),
      recurrence: (sess.recurrence as RecType) ?? "none",
      description: sess.description ?? "",
    });
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditing(null);
  }

  function handleSave() {
    if (!form.title || !form.subjectId || !form.startTime || !form.endTime) {
      return toast.error("All fields required");
    }

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    if (start >= end) {
      return toast.error("End must be after start");
    }

    if (editing) {
      // TODO: implement updateSession mutation
      return toast.error("Update not yet implemented");
    }

    // create
    createMutation.mutate({
      title: form.title,
      startTime: start,
      endTime: end,
      subjectId: form.subjectId,
      recurrence: form.recurrence === "none" ? undefined : form.recurrence,
      description: form.description || undefined,
    });
  }

  const todayCount = sessions.filter((s) =>
    moment(s.startTime).isSame(new Date(), "day"),
  ).length;

  const weekCount = sessions.filter((s) =>
    moment(s.startTime).isSame(new Date(), "week"),
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + Dialog */}
      <header className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">Schedule</h1>
            <p className="text-gray-600">Manage your study sessions</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => !o && closeDialog()}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Session" : "Create New Session"}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update details below."
                  : "Fill out to schedule a session."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Subject</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, subjectId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s) => (
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
                  <Label>Start</Label>
                  <Input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End</Label>
                  <Input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Recurrence</Label>
                <Select
                  value={form.recurrence}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, recurrence: v as RecType }))
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
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.status === "pending"}
              >
                {createMutation.status === "pending"
                  ? "Saving..."
                  : editing
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Today&apos;s</CardTitle>
            <CalendarIcon className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>This Week</CardTitle>
            <CalendarDays className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Study Time</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            {/* You can compute hours here */}
            <div className="text-2xl font-bold">—h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Completion</CardTitle>
            <Play className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—%</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar / Table */}
      <div className="p-4">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> Calendar
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" /> Table
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-4 h-[600px]">
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              defaultView={Views.WEEK}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              eventPropGetter={eventPropGetter}
              onSelectEvent={(e) => openEdit(e.resource)}
              popup
            />
          </TabsContent>

          <TabsContent value="table" className="mt-4 space-y-4">
            {sessions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">No sessions scheduled</p>
              </div>
            ) : (
              sessions.map((s) => (
                <Card key={s.id} className="hover:shadow-md">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-sm text-gray-600">{s.subject.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(s)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
