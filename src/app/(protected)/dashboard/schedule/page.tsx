"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
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
import { Calendar as CalendarIcon, Edit, Trash2, List } from "lucide-react";
import moment from "moment";

import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "hooks/use-refetch";
import FadeLoader from "react-spinners/FadeLoader";
import ScheduleHeader from "@/components/schedule-header";
import CalendarComponent from "@/components/calendar";
import type { StudySession, FormState, RecType } from "@/types";
import TopHeader from "@/components/TopHeader";

export default function SchedulePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StudySession | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    subjectId: "",
    startTime: "",
    endTime: "",
    recurrence: "none",
    recurrenceDays: [] as number[],
    description: "",
  });

  const refetch = useRefetch();

  const subjects = api.subject.getSubjects.useQuery().data;
  const { data: rawSessions, isPending } =
    api.session.getAllSessions.useQuery();

  // Sessions mutations
  const createMutation = api.session.createSession.useMutation({
    onSuccess: () => {
      toast.success("Session created");
      void refetch();
      closeDialog();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = api.session.updateSession.useMutation({
    onSuccess: () => {
      toast.success("Session updated");
      void refetch();
      closeDialog();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = api.session.deleteSession.useMutation({
    onSuccess: () => {
      toast.success("Session deleted");
      void refetch();
      closeDialog();
    },
    onError: () => toast.error("Failed to delete the session"),
  });

  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    return () => clearTimeout(t);
  }, []);

  // Custom recurrence helpers
  const WEEKDAYS = [
    { short: "S", label: "Sun", idx: 0 },
    { short: "M", label: "Mon", idx: 1 },
    { short: "T", label: "Tue", idx: 2 },
    { short: "W", label: "Wed", idx: 3 },
    { short: "T", label: "Thu", idx: 4 },
    { short: "F", label: "Fri", idx: 5 },
    { short: "S", label: "Sat", idx: 6 },
  ];

  function toggleDay(idx: number) {
    setForm((f) => {
      const has = f.recurrenceDays.includes(idx);
      return {
        ...f,
        recurrenceDays: has
          ? f.recurrenceDays.filter((d) => d !== idx)
          : [...f.recurrenceDays, idx],
      };
    });
  }

  function daySelected(idx: number) {
    return form.recurrenceDays.includes(idx);
  }

  // Safely default to empty array:
  const sessions: StudySession[] = (rawSessions ?? [])
    .filter((s) => typeof s.subjectId === "string" && s.subjectId && s.subject)
    .map((s) => ({
      id: s.id,
      title: s.title,
      nextSessionDate: s.nextSessionDate,
      nextSessionEndDate: s.nextSessionEndDate,
      startTime: new Date(s.startTime),
      endTime: new Date(s.endTime),
      subjectId: s.subjectId!,
      subject: s.subject as { id: string; title: string; color: string },
      recurrence: s.recurrence,
      recurrenceDays: s.recurrenceDays ?? [],
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

  function openCreate() {
    setEditing(null);
    setForm({
      title: "",
      subjectId: "",
      startTime: "",
      endTime: "",
      recurrence: "none",
      recurrenceDays: [],
      description: "",
    });
    setIsDialogOpen(true);
  }

  function openEdit(sess: StudySession) {
    setEditing(sess);
    setForm({
      title: sess.title,
      subjectId: sess.subjectId,
      startTime: moment(sess.startTime).local().format("YYYY-MM-DDTHH:mm"),
      endTime: moment(sess.endTime).local().format("YYYY-MM-DDTHH:mm"),
      recurrence: (sess.recurrence as RecType) ?? "none",
      recurrenceDays: sess.recurrenceDays ?? [],
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

    // Parse the local datetime string into a moment object
    const localStartMoment = moment(form.startTime);
    const localEndMoment = moment(form.endTime);

    // Converting local moments to UTC Date objects for database storage
    const start = localStartMoment.toDate();
    const end = localEndMoment.toDate();

    if (start >= end) {
      return toast.error("End must be after start");
    }

    // const now = new Date();

    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        title: form.title,
        startTime: start,
        endTime: end,
        subjectId: form.subjectId,
        recurrence: form.recurrence,
        recurrenceDays: form.recurrenceDays,
        description: form.description || undefined,
      });
      return;
    }

    // create
    createMutation.mutate({
      title: form.title,
      startTime: start,
      endTime: end,
      subjectId: form.subjectId,
      recurrence: form.recurrence === "none" ? undefined : form.recurrence,
      recurrenceDays: form.recurrenceDays,
      description: form.description || undefined,
    });
  }

  function handleDelete(sessionId: string) {
    if (!editing) {
      deleteMutation.mutate({
        id: sessionId,
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader
        functionProp={openCreate}
        title="Schedule"
        subtitle="Manage your study sessions"
        buttonText="New Session"
      />
      <ScheduleHeader />

      {/* Calendar / Table */}
      {isPending ? (
        <div className="px-auto flex h-64 items-center justify-center">
          <FadeLoader className="h-15 w-15" color="#a5a7a9" />
        </div>
      ) : (
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

            <TabsContent value="calendar" className="mt-4 h-[700px]">
              <CalendarComponent
                events={calendarEvents}
                onSelectEvent={openEdit}
                onDateSelect={(start, end) => {
                  setForm((prev) => ({
                    ...prev,
                    startTime: moment(start).local().format("YYYY-MM-DDTHH:mm"),
                    endTime: moment(end).local().format("YYYY-MM-DDTHH:mm"),
                  }));
                  openCreate();
                }}
                isLoading={isPending}
              />
            </TabsContent>

            <TabsContent value="table" className="mt-4 space-y-4">
              {sessions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">No sessions scheduled</p>
                </div>
              ) : (
                sessions.map((s) => (
                  <Card key={s.id} className="py-4 hover:shadow-md">
                    <CardContent className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: s.subject.color,
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {s.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {s.subject.title}
                          </p>
                          <div className="mt-1 flex gap-2 text-sm text-gray-500">
                            <p>
                              {moment(s.startTime).format("ddd, DD/MM/yyyy")}
                            </p>
                            <p>
                              {s.startTime.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {s.endTime.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
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
                          onClick={() => {
                            handleDelete(s.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={(o) => !o && closeDialog()}>
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
                onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v }))}
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
                <DatePicker
                  selected={form.startTime ? new Date(form.startTime) : null}
                  onChange={(date) => {
                    if (date) {
                      setForm((f) => ({
                        ...f,
                        startTime: date.toISOString(),
                      }));
                    }
                  }}
                  autoFocus={false}
                  showTimeSelect
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-none focus:ring-0 focus:outline-none"
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  placeholderText="dd/mm/yyyy HH:mm"
                  dateFormat="dd/MM/yyyy HH:mm"
                />
              </div>
              <div className="grid gap-2">
                <Label>End</Label>
                <DatePicker
                  selected={form.endTime ? new Date(form.endTime) : null}
                  onChange={(date) => {
                    if (date) {
                      setForm((f) => ({
                        ...f,
                        endTime: date.toISOString(),
                      }));
                    }
                  }}
                  autoFocus={false}
                  showTimeSelect
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-none focus:ring-0 focus:outline-none"
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  placeholderText="dd/mm/yyyy HH:mm"
                  dateFormat="dd/MM/yyyy HH:mm"
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
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.recurrence === "custom" && (
              <div className="grid gap-2">
                <Label>Choose days</Label>
                <div className="flex gap-2">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d.idx}
                      type="button"
                      onClick={() => toggleDay(d.idx)}
                      aria-pressed={daySelected(d.idx)}
                      className={`rounded-md border px-3 py-2 text-sm ${
                        daySelected(d.idx)
                          ? "text-foreground border-transparent bg-gray-300"
                          : "bg-background"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs">{d.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {form.recurrence === "custom" &&
                  form.recurrenceDays.length === 0 && (
                    <p className="text-destructive mt-1 text-xs">
                      Pick at least one day for a custom recurrence.
                    </p>
                  )}
              </div>
            )}
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
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="cursor-pointer"
              disabled={
                createMutation.status === "pending" ||
                updateMutation.status === "pending"
              }
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
    </div>
  );
}
