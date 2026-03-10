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
  householdId?: string;
}

export interface Stats {
  mean: number;
  median: number;
  stdDev: number;
  trend: 'faster' | 'slower' | 'stable';
  dowAnalysis: { day: string; avg: number }[];
  fatigueScore: number;
  durationDiff: number | null;
  totalTimeWasted: number; // in seconds
}

export interface Household {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  members: string[];
  inviteCode: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  householdId?: string;
  createdAt: string;
}
