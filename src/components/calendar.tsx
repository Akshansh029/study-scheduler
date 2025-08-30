"use client";

import enGbLocale from "@fullcalendar/core/locales/en-gb";
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
import type { CalendarComponentProps } from "@/types";
import moment from "moment";

export default function CalendarComponent({
  events,
  onSelectEvent,
  onDateSelect,
  isLoading = false,
}: CalendarComponentProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const WEEKDAY_TOKENS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  const transformEvents = (): EventInput[] => {
    return events.map((evt) => {
      const { resource: session } = evt;

      const baseEvent: EventInput = {
        id: session.id,
        title: session.title,
        backgroundColor: session.subject.color,
        borderColor: session.subject.color,
        textColor: "white",
        description: session.description ?? "",
        start: session.startTime,
        end: session.endTime,
        allDay: false,
      };

      const recurrence = session.recurrence ?? "none";

      if (recurrence && recurrence !== "none") {
        // Map your app-level recurrence to a valid RRule freq string.
        // Valid high-level freq values are: 'YEARLY','MONTHLY','WEEKLY','DAILY' (prefer these)
        let freq: string | undefined;
        const recurLower = String(recurrence).toLowerCase();

        if (recurLower === "custom") {
          freq = "WEEKLY";
        } else if (recurLower === "daily") {
          freq = "DAILY";
        } else if (recurLower === "weekly") {
          freq = "WEEKLY";
        } else if (recurLower === "monthly") {
          freq = "MONTHLY";
        } else {
          // unsupported recurrence token — skip rrule to avoid breaking calendar
          console.warn(
            "Unsupported recurrence token for session",
            session.id,
            session.recurrence,
          );
          freq = undefined;
        }

        if (freq) {
          const ms = session.endTime.getTime() - session.startTime.getTime();
          const hours = Math.floor(ms / (1000 * 60 * 60));
          const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
          const isoDuration = `PT${hours}H${minutes}M`;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rrule: any = {
            freq: freq, // e.g. 'WEEKLY'
            dtstart:
              session.startTime instanceof Date
                ? session.startTime.toISOString()
                : moment(session.startTime).format("YYYY-MM-DD[T]HH:mm:ss"),
          };

          // If custom weekly days saved, map them to byweekday tokens
          if (
            recurLower === "custom" &&
            Array.isArray(session.recurrenceDays) &&
            session.recurrenceDays.length
          ) {
            rrule.byweekday = session.recurrenceDays
              .filter((d: number) => Number.isInteger(d) && d >= 0 && d <= 6)
              .map((d: number) => WEEKDAY_TOKENS[d]);
          }

          baseEvent.rrule = rrule;
          baseEvent.duration = isoDuration;
        }
      }

      console.debug(
        "session recurrence",
        session.id,
        session.recurrence,
        session.recurrenceDays,
      );
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
        timeZone="local"
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
        locale="en-gb" // Date format as dd/mm
        locales={[enGbLocale]}
        firstDay={1}
        eventClick={handleEventClick}
        select={handleDateSelect}
        events={transformEvents()}
        height="700px"
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        nowIndicator
        slotDuration="00:30:00"
        snapDuration="00:15:00"
        expandRows={true}
        slotLabelFormat={{
          hour: "numeric",
          hour12: true,
        }}
        eventTimeFormat={{
          hour: "numeric",
          hour12: true,
        }}
      />
    </div>
  );
}
