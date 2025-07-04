import { db } from "../server/db";
import moment from "moment";

export const resetRecurringStatuses = async () => {
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

      // Advance nextSessionDate until it's TODAY or LATER
      while (moment(nextSessionDate).isBefore(todayStart, "day")) {
        if (recurrence === "daily") {
          nextSessionDate = moment(nextSessionDate).add(1, "day").toDate();
        } else if (recurrence === "weekly") {
          nextSessionDate = moment(nextSessionDate).add(1, "week").toDate();
        } else if (recurrence === "monthly") {
          nextSessionDate = moment(nextSessionDate).add(1, "month").toDate();
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
};
