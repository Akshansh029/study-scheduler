// utils/resetRecurringStatuses.ts
import { db } from "@/server/db";
import moment from "moment";

export const resetRecurringStatuses = async () => {
  const today = moment().startOf("day");
  const dayOfWeek = today.day(); // Sunday = 0
  const dayOfMonth = today.date();

  const sessions = await db.studySession.findMany({
    where: {
      recurrence: {
        not: "none",
      },
    },
  });

  for (const session of sessions) {
    // const sessionDay = moment(session.startTime).day();
    // const sessionDate = moment(session.startTime).date();

    let shouldReset = false;

    // if (session.recurrence === "daily") {
    //   shouldReset = true;
    // } else if (session.recurrence === "weekly" && sessionDay === dayOfWeek) {
    //   shouldReset = true;
    // } else if (session.recurrence === "monthly" && sessionDate === dayOfMonth) {
    //   shouldReset = true;
    // }
    if (session.recurrence !== "none") shouldReset = true;

    if (shouldReset) {
      await db.studySession.update({
        where: { id: session.id },
        data: { status: "upcoming" },
      });
    }
  }

  console.log("✅ Recurring session statuses reset.");
};
