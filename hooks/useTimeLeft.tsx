import { UseTimeLeftProps } from '@/lib/types';
import { useEffect, useState } from 'react';

const useTimeLeft = ({
  createdAt,
  durationInMinutes = 15,
}: UseTimeLeftProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const createdTime = new Date(createdAt).getTime();
      const deadline = createdTime + durationInMinutes * 60 * 1000;
      const now = Date.now();
      const difference = deadline - now;

      return Math.max(0, Math.floor(difference / 1000));
    };

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [createdAt, durationInMinutes]);

  return { timeLeft };
};

export default useTimeLeft;
