import * as ss from 'simple-statistics';
import { format, parseISO, getDay, subDays, isAfter, isBefore } from 'date-fns';
import { Session, Stats } from './types';

export const calculateStats = (sessions: Session[]): Stats | null => {
  if (sessions.length === 0) return null;

  const durations = sessions.map(s => s.duration_seconds);
  const mean = ss.mean(durations);
  const median = ss.median(durations);
  const stdDev = sessions.length > 1 ? ss.standardDeviation(durations) : 0;

  // Trend Analysis (Linear Regression on recent sessions only)
  let trend: 'faster' | 'slower' | 'stable' = 'stable';
  if (sessions.length > 1) {
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Use only the last 10 sessions (or all if fewer than 10) for trend calculation
    const recentSessions = sortedSessions.slice(-10);
    const data = recentSessions.map((s, i) => [i, s.duration_seconds]);
    const regression = ss.linearRegression(data);
    if (regression.m < -0.5) trend = 'faster';
    else if (regression.m > 0.5) trend = 'slower';
  }

  // Day of Week Analysis (Monday as first day)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dowMap: Record<string, number[]> = {};
  sessions.forEach(s => {
    const dayIndex = getDay(parseISO(s.date)); // 0 = Sunday, 1 = Monday, etc.
    // Convert to Monday-first: Monday=0, Tuesday=1, ..., Sunday=6
    const mondayFirstIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    const day = days[mondayFirstIndex];
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

  // Selection Debt (Total cumulative time wasted)
  const totalTimeWasted = durations.reduce((sum, duration) => sum + duration, 0);

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
    durationDiff,
    totalTimeWasted
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

export const formatTimeWasted = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    const remainingHours = hours % 24;
    const remainingMins = mins % 60;
    if (remainingHours === 0 && remainingMins === 0) {
      return `${days}d`;
    } else if (remainingMins === 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days}d ${remainingHours}h ${remainingMins}m`;
  } else if (hours > 0) {
    const remainingMins = mins % 60;
    if (remainingMins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMins}m`;
  } else {
    return `${mins}m`;
  }
};

export const exportSessionsToCSV = (sessions: Session[]): void => {
  if (sessions.length === 0) {
    alert('No sessions to export');
    return;
  }

  // CSV headers
  const headers = ['Date', 'Title', 'Duration (MM:SS)', 'Duration (seconds)', 'Rating', 'Genre', 'Release Year'];
  
  // Convert sessions to CSV rows
  const rows = sessions.map(session => [
    session.date,
    `"${session.title.replace(/"/g, '""')}"`, // Escape quotes in title
    formatDuration(session.duration_seconds),
    session.duration_seconds.toString(),
    session.rating.toString(),
    session.genre || '',
    session.release_year?.toString() || ''
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `filmflow-sessions-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseSessionsFromCSV = (csvText: string): Omit<Session, 'id' | 'created_at' | 'userId' | 'householdId'>[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) throw new Error("CSV file is empty or missing data.");

  // Parse header
  const headerRow = lines[0].split(',').map(h => h.trim());
  const dateIdx = headerRow.indexOf('Date');
  const titleIdx = headerRow.indexOf('Title');
  const durationMMSSIdx = headerRow.indexOf('Duration (MM:SS)');
  const durationSecIdx = headerRow.indexOf('Duration (seconds)');
  const ratingIdx = headerRow.indexOf('Rating');
  const genreIdx = headerRow.indexOf('Genre');
  const releaseYearIdx = headerRow.indexOf('Release Year');

  if (dateIdx === -1) throw new Error("CSV is missing the required 'Date' column.");
  if (durationMMSSIdx === -1 && durationSecIdx === -1) throw new Error("CSV is missing a 'Duration' column.");

  const parsedSessions = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV row parser handling quotes
    const cols = [];
    let inQuotes = false;
    let currentVal = "";
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' && line[j+1] === '"') {
        currentVal += '"';
        j++; // skip escaped quote marker
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(currentVal);
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    cols.push(currentVal); // push remainder

    const dateVal = cols[dateIdx]?.trim();
    if (!dateVal) throw new Error(`Row ${i + 1} is missing a Date.`);

    let durationSecs = 0;
    if (durationSecIdx !== -1 && cols[durationSecIdx]?.trim()) {
      durationSecs = parseInt(cols[durationSecIdx].trim(), 10);
    } else if (durationMMSSIdx !== -1 && cols[durationMMSSIdx]?.trim()) {
      const parts = cols[durationMMSSIdx].trim().split(':');
      if (parts.length === 2 && !isNaN(parseInt(parts[0], 10)) && !isNaN(parseInt(parts[1], 10))) {
        durationSecs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      } else {
        throw new Error(`Row ${i + 1} has invalid duration format (expected MM:SS).`);
      }
    } else {
      throw new Error(`Row ${i + 1} is missing a duration.`);
    }

    const rawTitle = titleIdx !== -1 && cols[titleIdx]?.trim() ? cols[titleIdx].trim() : 'Unknown';
    const cleanTitle = rawTitle.startsWith('"') && rawTitle.endsWith('"') ? rawTitle.slice(1, -1) : rawTitle;

    const ratingVal = ratingIdx !== -1 && cols[ratingIdx]?.trim() ? parseInt(cols[ratingIdx].trim(), 10) : 0;
    const genreVal = genreIdx !== -1 && cols[genreIdx]?.trim() ? cols[genreIdx].trim() : 'Unknown';
    
    const releaseYearVal = releaseYearIdx !== -1 && cols[releaseYearIdx]?.trim() 
      ? parseInt(cols[releaseYearIdx].trim(), 10) 
      : undefined;

    parsedSessions.push({
      date: dateVal,
      title: cleanTitle,
      duration_seconds: durationSecs,
      rating: isNaN(ratingVal) ? 0 : ratingVal,
      genre: genreVal,
      ...(releaseYearVal && !isNaN(releaseYearVal) ? { release_year: releaseYearVal } : {})
    });
  }

  return parsedSessions;
};
