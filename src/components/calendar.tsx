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
import type { CalendarComponentProps } from "@/types";
import moment from "moment";

export default function CalendarComponent({
  events,
  onSelectEvent,
  onDateSelect,
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
        description: session.description ?? "",
        start: session.startTime,
        end: session.endTime,
        allDay: false,
      };

      if (session.recurrence && session.recurrence !== "none") {
        const ms = session.endTime.getTime() - session.startTime.getTime();
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const isoDuration = `PT${hours}H${minutes}M`;

        baseEvent.rrule = {
          freq: session.recurrence.toUpperCase(),
          // dtstart: session.startTime,
          dtstart: moment(session.startTime).format("YYYY-MM-DD[T]HH:mm:ss"),
          // until: session.endTime, // This was the problematic line for 'until'
        };

        baseEvent.duration = isoDuration;
      }

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
        dayHeaderFormat={{
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
        }}
      />
    </div>
  );
}
