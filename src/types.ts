export interface Session {
  id: string;
  date: string;
  duration_seconds: number;
  title: string;
  rating: number;
  genre?: string;
  release_year?: number;
  created_at: string;
  userId?: string;
}

export interface Stats {
  mean: number;
  median: number;
  stdDev: number;
  trend: 'faster' | 'slower' | 'stable';
  dowAnalysis: { day: string; avg: number }[];
  fatigueScore: number;
  durationDiff: number | null;
}
