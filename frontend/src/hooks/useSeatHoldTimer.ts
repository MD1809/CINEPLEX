import { useState, useEffect } from 'react';
import { useBookingStore } from '../stores/bookingStore';

interface UseSeatHoldTimerOptions {
  onExpire?: () => void;
  onWarning?: () => void;
}

export const useSeatHoldTimer = (options?: UseSeatHoldTimerOptions) => {
  const { holdExpiresAt, holdSessionId, remainingSeconds, updateRemainingSeconds } = useBookingStore();
  const [secondsLeft, setSecondsLeft] = useState<number>(remainingSeconds || 0);

  useEffect(() => {
    if (!holdExpiresAt || !holdSessionId) {
      setSecondsLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const expireTime = new Date(holdExpiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expireTime - now) / 1000));
      return diff;
    };

    const initial = calculateTimeLeft();
    setSecondsLeft(initial);
    updateRemainingSeconds(initial);

    const interval = setInterval(() => {
      const diff = calculateTimeLeft();
      setSecondsLeft(diff);
      updateRemainingSeconds(diff);

      if (diff === 60 && options?.onWarning) {
        options.onWarning();
      }

      if (diff <= 0) {
        clearInterval(interval);
        if (options?.onExpire) {
          options.onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, holdSessionId]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = secondsLeft > 0 && secondsLeft <= 60;
  const isExpired = secondsLeft <= 0 && !!holdSessionId;
  const percentage = Math.min(100, Math.max(0, (secondsLeft / 300) * 100));

  return {
    secondsLeft,
    minutes,
    seconds,
    formattedTime,
    isWarning,
    isExpired,
    percentage,
  };
};
