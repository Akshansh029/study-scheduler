// src/hooks/useSessionTimer.ts
"use client";

import { useStopwatch } from "react-timer-hook";
import { useEffect, useRef, useState } from "react";

export function useSessionTimer() {
  const startTimeRef = useRef<Date | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sessionStart");
    if (stored) {
      startTimeRef.current = new Date(stored);
    } else {
      const now = new Date();
      localStorage.setItem("sessionStart", now.toISOString());
      startTimeRef.current = now;
    }
    setHydrated(true);
  }, []);

  const elapsedSeconds =
    hydrated && startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
      : 0;

  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useStopwatch({
    autoStart: false,
    offsetTimestamp: new Date(Date.now() - elapsedSeconds * 1000),
  });

  useEffect(() => {
    if (hydrated) {
      startTimer();
    }
    // we only want this to run once, right after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const clear = () => {
    localStorage.removeItem("sessionStart");
    resetTimer();
  };

  return {
    hours,
    minutes,
    seconds,
    isRunning,
    start: startTimer,
    pause: pauseTimer,
    reset: clear,
  };
}
