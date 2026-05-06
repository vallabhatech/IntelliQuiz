"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(initialSeconds: number, onExpire?: () => void) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clear]);

  const reset = useCallback(
    (seconds: number) => {
      clear();
      setRemaining(seconds);
    },
    [clear]
  );

  const pause = useCallback(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  return { remaining, start, reset, pause };
}
