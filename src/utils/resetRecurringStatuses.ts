import { db } from "@/server/db";
import moment from "moment";

export default async function resetRecurringStatuses() {
  const todayStart = moment().startOf("day");

  try {
    const sessions = await db.studySession.findMany({
      where: { recurrence: { not: "none" } },
    });

    console.log(`Found ${sessions.length} recurring sessions to process`);

    const updatePromises = sessions.map(async (s) => {
      const recurrence = s.recurrence;
      let nextSessionDate = s.nextSessionDate;
      let nextSessionEndDate = s.nextSessionEndDate;
      const durationMs = moment(s.nextSessionEndDate).diff(s.nextSessionDate);

      // normalize recurrenceDays (may be null or undefined)
      const recurrenceDays: number[] = Array.isArray(s.recurrenceDays)
        ? s.recurrenceDays.map(Number).filter((d) => d >= 0 && d <= 6)
        : [];

      // Advance nextSessionDate until it's today or later
      while (moment(nextSessionDate).isBefore(todayStart, "day")) {
        if (recurrence === "daily") {
          nextSessionDate = moment(nextSessionDate).add(1, "day").toDate();
        } else if (recurrence === "weekly") {
          nextSessionDate = moment(nextSessionDate).add(1, "week").toDate();
        } else if (recurrence === "monthly") {
          nextSessionDate = moment(nextSessionDate).add(1, "month").toDate();
        } else if (recurrence === "custom" && recurrenceDays.length > 0) {
          const currentDay = moment(nextSessionDate).day(); // 0=Sun … 6=Sat

          // find the next recurrence day
          const sortedDays = [...new Set(recurrenceDays)].sort((a, b) => a - b);
          const nextDayGreater = sortedDays.find((d) => d > currentDay);

          const deltaDays =
            typeof nextDayGreater === "number"
              ? nextDayGreater - currentDay
              : typeof sortedDays[0] === "number"
                ? 7 - currentDay + sortedDays[0]
                : 0;

          nextSessionDate = moment(nextSessionDate)
            .add(deltaDays, "days")
            .toDate();
        } else {
          // fallback: break if recurrence is invalid
          break;
        }

        nextSessionEndDate = new Date(nextSessionDate.getTime() + durationMs);
      }

      // Update the session
      return db.studySession.update({
        where: { id: s.id },
        data: {
          nextSessionDate,
          nextSessionEndDate,
          status: "upcoming",
        },
      });
    });

    await Promise.all(updatePromises);
    console.log(`Successfully updated ${sessions.length} recurring sessions`);
  } catch (error) {
    console.error("❌ Error in resetRecurringStatuses:", error);
    throw error;
  }
}
