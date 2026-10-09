import { useEffect, useState } from 'react';

// Live local time (HH:MM:SS) in the given time zone, for the hero status row and the footer.
// Starts as null so the pre-rendered HTML shows a placeholder and hydrates cleanly.
export function useClock(timeZone) {
  const [time, setTime] = useState(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [timeZone]);
  return time;
}
