"use client";
import React, { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import type {
  EventClickArg,
  DateSelectArg,
  EventInput,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import rrulePlugin from "@fullcalendar/rrule";

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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: StudySession;
}

interface CalendarComponentProps {
  events: CalendarEvent[];
  onSelectEvent: (session: StudySession) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  eventPropGetter?: (event: CalendarEvent) => { style: React.CSSProperties };
  isLoading?: boolean;
}

// Define RRule interface to match FullCalendar's expected structure
interface RRuleConfig {
  freq: string;
  dtstart: Date | string;
  until?: Date | string; // 'until' should be a date, not a specific time usually.
}

export default function CalendarComponent({
  events,
  onSelectEvent,
  onDateSelect,
  eventPropGetter,
  isLoading = false,
}: CalendarComponentProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const transformEvents = (): EventInput[] => {
    return events.map((evt) => {
      const { resource: session } = evt;
      const baseEvent: EventInput = {
        id: session.id,
        title: session.title,
        backgroundColor: session.subject.color,
        borderColor: session.subject.color,
        textColor: "white",
        description: session.description || "",
        // Always set start and end for proper time slot display for all events
        start: session.startTime,
        end: session.endTime,
        allDay: false, // Ensure it's not treated as an all-day event
      };

      if (session.recurrence && session.recurrence !== "none") {
        const ms = session.endTime.getTime() - session.startTime.getTime();
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const isoDuration = `PT${hours}H${minutes}M`;

        baseEvent.rrule = {
          freq: session.recurrence.toUpperCase(),
          dtstart: session.startTime, // Use the start time of the first event in the series
          // IMPORTANT: Remove or correctly set 'until'.
          // If the recurrence is meant to be indefinite, remove 'until'.
          // If there's a specific end date for the *series*, use a date-only Date object.
          // For now, removing it to fix the overlap issue.
          // until: session.endTime, // This was the problematic line for 'until'
        };

        baseEvent.duration = isoDuration;
        // The `start` and `end` on `baseEvent` already define the time of day for each recurrence.
        // FullCalendar uses `dtstart` from `rrule` to determine the initial date and time of the series,
        // and `duration` for how long each instance lasts.
        // `allDay: false` ensures it's placed in the time grid.
      }
      // For non-recurring events, `start`, `end`, and `allDay: false` are already correctly set above.

      return baseEvent;
    });
  };

  const handleEventClick = (clickInfo: EventClickArg): void => {
    // Find the original event to get the resource
    const originalEvent = events.find((e) => e.id === clickInfo.event.id);
    if (originalEvent) {
      onSelectEvent(originalEvent.resource);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg): void => {
    if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end);
    }
    // Clear the selection
    selectInfo.view.calendar.unselect();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full" style={{ minHeight: "700px" }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          listPlugin,
          rrulePlugin,
        ]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay,dayGridMonth",
        }}
        initialView="timeGridWeek" // Default to week view
        editable={false}
        selectable={!!onDateSelect}
        selectMirror
        dayMaxEvents
        eventClick={handleEventClick}
        select={handleDateSelect}
        events={transformEvents()}
        height="700px"
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={true}
        nowIndicator
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // All days
          startTime: "08:00",
          endTime: "22:00",
        }}
        slotDuration="00:30:00" // 30-minute slots
        snapDuration="00:15:00"
        expandRows={true}
      />
    </div>
  );
}
