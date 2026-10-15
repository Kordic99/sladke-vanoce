import { pragueToday } from "./calendar";

export function christmasCountdown(now: number) {
  const today = pragueToday(new Date(now));
  const thisYear = Number(today.slice(0, 4));
  const year = today > `${thisYear}-12-24` ? thisYear + 1 : thisYear;
  const isChristmas = today === `${thisYear}-12-24`;
  const target = Date.parse(`${year}-12-24T00:00:00+01:00`);
  const remaining = Math.max(0, Math.floor((target - now) / 1000));
  return {
    year, isChristmas,
    days: Math.floor(remaining / 86400),
    hours: Math.floor(remaining / 3600) % 24,
    minutes: Math.floor(remaining / 60) % 60,
    seconds: remaining % 60,
  };
}
