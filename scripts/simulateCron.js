"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var resetRecurringStatus_1 = require("../src/utils/resetRecurringStatus");
(0, resetRecurringStatus_1.resetRecurringStatuses)()
    .then(function () {
    console.log("✅ Simulated cron finished");
    process.exit(0);
})
    .catch(function (err) {
    console.error("❌ Error running simulated cron:", err);
    process.exit(1);
});
