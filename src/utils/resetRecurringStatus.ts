// // utils/resetRecurringStatuses.ts
// import { db } from "@/server/db";
// import moment from "moment";

// export const resetRecurringStatuses = async () => {
//   const today = moment().startOf("day");
//   const dayOfWeek = today.day(); // Sunday = 0
//   const dayOfMonth = today.date();

//   const sessions = await db.studySession.findMany({
//     where: {
//       recurrence: {
//         not: "none",
//       },
//     },
//   });

//   for (const session of sessions) {
//     const sessionDay = moment(session.startTime).day();
//     const sessionDate = moment(session.startTime).date();

//     let shouldReset = false;

//     if (session.recurrence === "daily") {
//       shouldReset = true;
//     } else if (session.recurrence === "weekly" && sessionDay === dayOfWeek) {
//       shouldReset = true;
//     } else if (session.recurrence === "monthly" && sessionDate === dayOfMonth) {
//       shouldReset = true;
//     }
//     if (session.recurrence !== "none") shouldReset = true;

//     if (shouldReset) {
//       await db.studySession.update({
//         where: { id: session.id },
//         data: { status: "upcoming" },
//       });
//     }
//   }

//   console.log("✅ Recurring session statuses reset.");
// };

// utils/resetRecurringStatuses.ts
import { db } from "@/server/db";
import moment from "moment";

export const resetRecurringStatuses = async () => {
  const todayStart = moment().startOf("day");
  const sessions = await db.studySession.findMany({
    where: { recurrence: { not: "none" } },
  });

  for (const s of sessions) {
    const recurrence = s.recurrence;

    // these two will be updated in the loop
    let nextSessionDate = s.nextSessionDate;
    let nextSessionEndDate = s.nextSessionEndDate;
    const durationMs = moment(s.nextSessionEndDate).diff(s.nextSessionDate);

    // 1) Advance nextSessionDate until it’s TODAY or LATER
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

    // 2) Reset status to upcoming
    await db.studySession.update({
      where: { id: s.id },
      data: {
        nextSessionDate,
        nextSessionEndDate,
        status: "upcoming",
      },
    });
  }

  console.log("✅ Recurring session dates & statuses reset.");
};
