"use client";

import { useEffect, useState } from "react";
import { getLocalDateKey } from "@/lib/date-utils";

export function useLocalDateKey() {
  const [dateKey, setDateKey] = useState(() => getLocalDateKey());

  useEffect(() => {
    const scheduleNextUpdate = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 50);

      const timeoutId = window.setTimeout(() => {
        setDateKey(getLocalDateKey());
      }, nextMidnight.getTime() - now.getTime());

      return timeoutId;
    };

    const timeoutId = scheduleNextUpdate();
    return () => window.clearTimeout(timeoutId);
  }, [dateKey]);

  return dateKey;
}
