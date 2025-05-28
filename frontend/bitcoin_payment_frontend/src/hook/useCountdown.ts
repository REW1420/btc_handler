import { useEffect, useState, useRef } from "react";

export function useCountdown({
  key = "countdownStart",
  duration = 300,
  onExpire,
}: {
  key?: string;
  duration?: number;
  onExpire?: () => void;
}) {
  const [remaining, setRemaining] = useState<number>(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    let startTime = stored ? parseInt(stored) : Date.now();

    if (!stored) {
      localStorage.setItem(key, startTime.toString());
    }

    const update = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const newRemaining = duration - elapsed;

      if (newRemaining <= 0) {
        clear();
        setRemaining(0);
        localStorage.removeItem(key);
        if (onExpire) onExpire();
        return;
      }

      setRemaining(newRemaining);
    };

    intervalRef.current = setInterval(update, 1000);
    update();

    return clear;
  }, []);

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    const newStart = Date.now();
    localStorage.setItem(key, newStart.toString());
    setRemaining(duration);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - newStart) / 1000);
      const newRemaining = duration - elapsed;

      if (newRemaining <= 0) {
        clearInterval(interval);
        setRemaining(0);
        localStorage.removeItem(key);
        if (onExpire) onExpire();
        return;
      }

      setRemaining(newRemaining);
    }, 1000);
    intervalRef.current = interval;
  };

  return { remaining, reset };
}
