import { resetRecurringStatuses } from "utils/resetRecurringStatus";

resetRecurringStatuses()
  .then(() => {
    console.log("✅ Simulated cron finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error running simulated cron:", err);
    process.exit(1);
  });
