import * as ss from 'simple-statistics';
import { format, parseISO, getDay, subDays, isAfter, isBefore } from 'date-fns';
import { Session, Stats } from './types';

export const calculateStats = (sessions: Session[]): Stats | null => {
  if (sessions.length === 0) return null;

  const durations = sessions.map(s => s.duration_seconds);
  const mean = ss.mean(durations);
  const median = ss.median(durations);
  const stdDev = sessions.length > 1 ? ss.standardDeviation(durations) : 0;

  // Trend Analysis (Linear Regression)
  let trend: 'faster' | 'slower' | 'stable' = 'stable';
  if (sessions.length > 1) {
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const data = sortedSessions.map((s, i) => [i, s.duration_seconds]);
    const regression = ss.linearRegression(data);
    if (regression.m < -0.5) trend = 'faster';
    else if (regression.m > 0.5) trend = 'slower';
  }

  // Day of Week Analysis
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dowMap: Record<string, number[]> = {};
  sessions.forEach(s => {
    const day = days[getDay(parseISO(s.date))];
    if (!dowMap[day]) dowMap[day] = [];
    dowMap[day].push(s.duration_seconds);
  });

  const dowAnalysis = days.map(day => ({
    day,
    avg: dowMap[day] ? Number((ss.mean(dowMap[day]) / 60).toFixed(2)) : 0
  }));

  // Decision Fatigue Score (1-10)
  const avgDuration = mean;
  const avgRating = ss.mean(sessions.map(s => s.rating));
  
  const durationComponent = Math.min(avgDuration / 1800, 1); // 30 mins max
  const ratingComponent = (10 - avgRating) / 9;
  const fatigueScore = Math.round((durationComponent * 0.6 + ratingComponent * 0.4) * 9 + 1);

  // Contextual Benchmark (vs last week or previous avg)
  const now = new Date();
  const lastWeekStart = subDays(now, 7);
  const twoWeeksAgoStart = subDays(now, 14);

  const thisWeekSessions = sessions.filter(s => isAfter(parseISO(s.date), lastWeekStart));
  const lastWeekSessions = sessions.filter(s => isBefore(parseISO(s.date), lastWeekStart) && isAfter(parseISO(s.date), twoWeeksAgoStart));

  let durationDiff: number | null = null;
  if (thisWeekSessions.length > 0 && lastWeekSessions.length > 0) {
    const thisWeekMean = ss.mean(thisWeekSessions.map(s => s.duration_seconds));
    const lastWeekMean = ss.mean(lastWeekSessions.map(s => s.duration_seconds));
    durationDiff = thisWeekMean - lastWeekMean;
  } else if (sessions.length >= 2) {
    const sorted = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0].duration_seconds;
    const previousMean = ss.mean(sorted.slice(1).map(s => s.duration_seconds));
    durationDiff = latest - previousMean;
  }

  return {
    mean,
    median,
    stdDev,
    trend,
    dowAnalysis,
    fatigueScore,
    durationDiff
  };
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDurationDiff = (seconds: number): string => {
  const sign = seconds > 0 ? '+' : '-';
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = Math.round(absSeconds % 60);
  return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
};
