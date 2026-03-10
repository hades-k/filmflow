/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, ReferenceLine
} from 'recharts';
import { 
  Film, Clock, TrendingUp, Calendar, AlertCircle, Plus, Trash2, 
  BarChart3, Info, Star, Pencil, LogOut, Users, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { Session, Stats } from './types';
import { calculateStats, formatDuration, formatDurationDiff, formatTimeWasted } from './utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from './hooks/useAuth';
import { getSessions, addSession, updateSession, deleteSession as deleteSessionService } from './services/sessionService';
import { HouseholdManager } from './components/HouseholdManager';
import { getUserProfile } from './services/householdService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('5');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [showHouseholdMenu, setShowHouseholdMenu] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);

  // Calculate stats and chart data - MUST be before any early returns
  const stats = useMemo(() => calculateStats(sessions), [sessions]);

  const chartData = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(s => ({
        date: format(parseISO(s.date), 'MMM dd'),
        duration: Number((s.duration_seconds / 60).toFixed(2)),
        title: s.title
      }));
  }, [sessions]);

  const { minDow, maxDow } = useMemo(() => {
    if (!stats?.dowAnalysis) return { minDow: null, maxDow: null };
    const activeDays = stats.dowAnalysis.filter(d => d.avg > 0);
    if (activeDays.length === 0) return { minDow: null, maxDow: null };
    let min = Infinity;
    let max = -Infinity;
    let minD: string | null = null;
    let maxD: string | null = null;
    activeDays.forEach(d => {
      if (d.avg < min) { min = d.avg; minD = d.day; }
      if (d.avg > max) { max = d.avg; maxD = d.day; }
    });
    return { minDow: minD, maxDow: maxD };
  }, [stats]);

  const { minIndex, maxIndex } = useMemo(() => {
    if (chartData.length === 0) return { minIndex: -1, maxIndex: -1 };
    let min = Infinity;
    let max = -Infinity;
    let minIdx = -1;
    let maxIdx = -1;
    chartData.forEach((d, i) => {
      if (d.duration < min) { min = d.duration; minIdx = i; }
      if (d.duration > max) { max = d.duration; maxIdx = i; }
    });
    return { minIndex: minIdx, maxIndex: maxIdx };
  }, [chartData]);

  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    
    const loadSessions = async () => {
      setDataLoading(true);
      try {
        console.log('Fetching sessions for user:', user.uid, 'householdId:', householdId);
        
        const data = await getSessions(user.uid, householdId || undefined);
        console.log('Sessions fetched:', data.length);
        if (mounted) {
          setSessions(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch sessions', err);
        if (mounted) {
          setError('Failed to load sessions. Please try refreshing the page.');
        }
      } finally {
        if (mounted) {
          setDataLoading(false);
        }
      }
    };

    loadSessions();
    
    return () => {
      mounted = false;
    };
  }, [user, householdId]);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const data = await getSessions(user.uid, householdId || undefined);
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  const logSession = async () => {
    if (!duration || !user) return;

    const [mins, secs] = duration.split(':').map(Number);
    const durationSeconds = (mins || 0) * 60 + (secs || 0);

    const sessionData = {
      date,
      duration_seconds: durationSeconds,
      title: title || 'Untitled',
      rating: rating ? parseInt(rating) : 0,
      genre: 'Unknown',
      release_year: null
    };

    try {
      if (editingSession) {
        await updateSession(editingSession.id, sessionData);
      } else {
        await addSession(user.uid, sessionData as any, householdId || undefined);
      }
      fetchSessions();
      closeForm();
    } catch (err) {
      console.error('Failed to log session', err);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSession(null);
    setTitle('');
    setDuration('');
    setRating('5');
  };

  const startEdit = (session: Session) => {
    setEditingSession(session);
    setTitle(session.title);
    setDuration(formatDuration(session.duration_seconds));
    setRating(session.rating.toString());
    setDate(session.date);
    setShowForm(true);
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSessionService(id);
      fetchSessions();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg text-accent flex items-center justify-center">
        <div className="text-center">
          <Film className="mx-auto mb-4 animate-pulse" size={48} />
          <p className="text-sm font-mono uppercase tracking-widest opacity-50">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg text-accent flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-serif italic tracking-tighter mb-4">FilmFlow</h1>
          <p className="text-sm font-mono opacity-50 uppercase tracking-widest mb-8">Decision Analytics Engine</p>
          <button 
            onClick={signIn}
            className="bg-accent text-bg px-8 py-4 rounded-full flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg mx-auto"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-bold uppercase tracking-widest">Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-bg text-accent flex items-center justify-center">
        <div className="text-center">
          <Film className="mx-auto mb-4 animate-pulse" size={48} />
          <p className="text-sm font-mono uppercase tracking-widest opacity-50">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-accent flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-serif mb-4">Error</h2>
          <p className="text-sm opacity-70 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-accent text-bg px-6 py-3 rounded-full hover:scale-105 transition-all"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-accent font-sans selection:bg-accent selection:text-bg relative">
      <div className="film-grain"></div>
      {/* Header */}
      <header className="border-b border-border p-8 flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tighter leading-none">FilmFlow</h1>
          <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.5em] mt-3">Decision Analytics Engine</p>
        </div>
        <div className="flex items-center gap-4">
          {user?.photoURL && (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-10 h-10 rounded-full border-2 border-accent/20"
            />
          )}
          {user?.displayName && (
            <span className="text-xs font-mono opacity-60 hidden sm:block">{user.displayName}</span>
          )}
          <button 
            onClick={() => setShowForm(true)}
            className="bg-accent text-bg px-8 py-3 rounded-full flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-white/5"
          >
            <Plus size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Add Session</span>
          </button>
          <button 
            onClick={() => setShowHouseholdMenu(true)}
            className="p-3 rounded-full hover:bg-accent/10 transition-all duration-300"
            title="Household settings"
          >
            <Users size={18} />
          </button>
          <button 
            onClick={signOut}
            className="p-3 rounded-full hover:bg-accent/10 transition-all duration-300"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Stats Grid */}
        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard 
            label="Mean Duration" 
            value={stats ? formatDuration(stats.mean) : '--'} 
            icon={<Clock size={18} />}
          />
          <StatCard 
            label="Median Duration" 
            value={stats ? formatDuration(stats.median) : '--'} 
            icon={<BarChart3 size={18} />}
          />
          <StatCard 
            label="The Scroll Toll" 
            value={stats ? formatTimeWasted(stats.totalTimeWasted) : '--'} 
            icon={<Clock size={18} />}
            subValue="Total time spent deciding"
          />
          <StatCard 
            label="Trend" 
            value={stats ? stats.trend.toUpperCase() : '--'} 
            icon={<TrendingUp size={18} />}
            subValue={stats?.trend === 'faster' ? 'Decisions are becoming more efficient over time' : stats?.trend === 'slower' ? 'Decision time is increasing, indicating potential fatigue' : 'Decision time is remaining consistent'}
            glowClass={stats?.trend === 'faster' ? 'glow-cyan' : undefined}
          />
          <StatCard 
            label="Fatigue Score" 
            value={stats ? `${stats.fatigueScore}/10` : '--'} 
            icon={<AlertCircle size={18} />}
            glowClass={stats ? (stats.fatigueScore >= 8 ? 'glow-red' : stats.fatigueScore >= 4 ? 'glow-gold' : 'glow-slate') : undefined}
            valueColor={stats ? (stats.fatigueScore >= 8 ? 'text-red-500' : stats.fatigueScore >= 4 ? 'text-yellow-500' : 'text-slate-400') : undefined}
          />
        </section>

        {/* Main Charts */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-card/40 backdrop-blur-[10px] border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-30 mb-8 flex items-center gap-2">
              <TrendingUp size={12} /> Duration History (min)
            </h3>
            <div className="h-[320px]">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs font-mono opacity-20 uppercase tracking-widest">No data to display</p>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E4E3E0" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#E4E3E0" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="strokeDimming" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#E4E3E0" stopOpacity={0.1}/>
                      <stop offset="100%" stopColor="#E4E3E0" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#1A1A1A" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#666', fontFamily: 'JetBrains Mono'}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#666', fontFamily: 'JetBrains Mono'}} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(20, 20, 20, 0.8)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px', 
                      border: '1px solid rgba(255, 255, 255, 0.05)', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                      color: '#E4E3E0'
                    }}
                    itemStyle={{ color: '#E4E3E0', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                    labelStyle={{ opacity: 0.5, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter' }}
                    formatter={(value: number) => [Number(value.toFixed(2)), 'Duration']}
                  />
                  {stats && <ReferenceLine y={Number((stats.mean / 60).toFixed(2))} stroke="#E4E3E0" strokeDasharray="3 3" strokeOpacity={0.3} />}
                  <Area 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="url(#strokeDimming)" 
                    strokeWidth={3} 
                    fillOpacity={1}
                    fill="url(#colorDuration)"
                    activeDot={{ r: 6, stroke: '#0A0A0A', strokeWidth: 2, fill: '#E4E3E0' }}
                    dot={(props: any) => {
                      const { cx, cy, index } = props;
                      const isLast = index === chartData.length - 1;
                      const isMin = index === minIndex;
                      const isMax = index === maxIndex;
                      
                      if (isMin) {
                        return <circle key={index} cx={cx} cy={cy} r={5} fill="#10B981" stroke="#050505" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }} />;
                      }
                      if (isMax) {
                        return <circle key={index} cx={cx} cy={cy} r={5} fill="#EF4444" stroke="#050505" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.8))' }} />;
                      }
                      if (isLast) {
                        return <circle key={index} cx={cx} cy={cy} r={5} fill="#E4E3E0" stroke="#050505" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 8px rgba(228,227,224,0.8))' }} />;
                      }
                      return <circle key={index} cx={cx} cy={cy} r={3} fill="#E4E3E0" opacity={0.2 + (index / chartData.length) * 0.8} />;
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-card/40 backdrop-blur-[10px] border border-white/5 p-8 rounded-[2rem]">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-30">Temporal Distribution (min)</h3>
              <div className="flex gap-4 text-[9px] font-mono uppercase tracking-widest">
                {minDow && <span className="text-emerald-500">Shortest: {minDow.substring(0, 3)}</span>}
                {maxDow && <span className="text-red-500">Longest: {maxDow.substring(0, 3)}</span>}
              </div>
            </div>
            <div className="h-[220px]">
              {!stats?.dowAnalysis || stats.dowAnalysis.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs font-mono opacity-20 uppercase tracking-widest">No data to display</p>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dowAnalysis}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fill: '#666'}} 
                    tickFormatter={(val) => val.substring(0, 3)}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                    contentStyle={{ 
                      backgroundColor: 'rgba(20, 20, 20, 0.8)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.05)', 
                      borderRadius: '12px',
                      color: '#E4E3E0'
                    }} 
                    itemStyle={{ color: '#E4E3E0', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                    labelStyle={{ opacity: 0.5, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter', color: '#E4E3E0' }}
                    formatter={(value: number) => [Number(value.toFixed(2)), 'Average']}
                  />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                    {stats.dowAnalysis.map((entry, index) => {
                      let fill = index % 2 === 0 ? '#E4E3E0' : '#444';
                      if (entry.day === minDow) fill = '#10B981';
                      if (entry.day === maxDow) fill = '#EF4444';
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Session List */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-30 px-2">Log History</h3>
          <div className="space-y-4">
            {(showAllSessions ? sessions : sessions.slice(0, 7)).map(session => (
              <motion.div 
                layout
                key={session.id}
                className="bg-card/40 backdrop-blur-[10px] border border-white/5 p-5 rounded-2xl flex justify-between items-center group film-light-leak sprocket-holes"
              >
                <div className="space-y-1">
                  <h4 className="font-serif text-3xl tracking-tight mb-2">{session.title}</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold uppercase opacity-50 tracking-widest">{format(parseISO(session.date), 'MMM dd')}</span>
                    <span className="text-xs font-mono font-bold uppercase text-accent tracking-widest transition-transform duration-300 group-hover:scale-110 group-hover:text-white origin-left">{formatDuration(session.duration_seconds)}</span>
                    <div className="flex items-center gap-1 ml-2">
                      {[...Array(10)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={10} 
                          className={i < session.rating ? "text-accent" : "text-accent opacity-20"} 
                          fill="currentColor" 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => startEdit(session)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-accent/10 hover:text-accent rounded-xl transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
            {sessions.length > 7 && !showAllSessions && (
              <button
                onClick={() => setShowAllSessions(true)}
                className="w-full py-4 text-center text-xs font-mono uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity border-2 border-dashed border-border rounded-2xl hover:border-accent/20"
              >
                Show More ({sessions.length - 7} hidden)
              </button>
            )}
            {sessions.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-border rounded-[2rem]">
                <Film className="mx-auto opacity-10 mb-4" size={40} />
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-20">Awaiting Data Input</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Household Menu Modal */}
      <AnimatePresence>
        {showHouseholdMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHouseholdMenu(false)}
              className="absolute inset-0 bg-bg/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-card border border-border w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <div className="p-10 border-b border-border flex justify-between items-start">
                <div>
                  <h2 className="text-4xl font-serif italic tracking-tighter">Household</h2>
                  <p className="text-[10px] font-mono opacity-30 uppercase tracking-widest mt-2">Manage shared access</p>
                </div>
                <button 
                  onClick={() => setShowHouseholdMenu(false)}
                  className="p-2 hover:bg-accent/10 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-10">
                <HouseholdManager 
                  userId={user.uid}
                  userEmail={user.email || ''}
                  userDisplayName={user.displayName || 'User'}
                  onHouseholdChange={(newHouseholdId) => {
                    setHouseholdId(newHouseholdId);
                    // Reload sessions when household changes
                    fetchSessions();
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="absolute inset-0 bg-bg/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-card border border-border w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <div className="p-10 border-b border-border">
                <h2 className="text-4xl font-serif italic tracking-tighter">{editingSession ? 'Edit Session' : 'Log Session'}</h2>
                <p className="text-[10px] font-mono opacity-30 uppercase tracking-widest mt-2">{editingSession ? 'Update decision parameters' : 'Input decision parameters'}</p>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-widest opacity-30">Movie Title (Optional)</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter movie title..."
                    className="w-full bg-bg border border-border px-6 py-4 rounded-2xl text-sm focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-widest opacity-30">Duration (MM:SS)</label>
                    <input 
                      type="text" 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="12:45"
                      className="w-full bg-bg border border-border px-6 py-4 rounded-2xl text-sm focus:outline-none focus:border-accent/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-widest opacity-30">Rating (Optional, 1-10)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="10"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      placeholder="0"
                      className="w-full bg-bg border border-border px-6 py-4 rounded-2xl text-sm focus:outline-none focus:border-accent/40 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-widest opacity-30">Session Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-bg border border-border px-6 py-4 rounded-2xl text-sm focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>

                <button 
                  onClick={logSession}
                  disabled={!duration}
                  className="w-full bg-accent text-bg py-6 rounded-3xl font-bold uppercase tracking-[0.2em] mt-6 disabled:opacity-10 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5"
                >
                  {editingSession ? 'Save Changes' : 'Finalize Entry'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  subValue, 
  glowClass,
  valueColor,
  subValueColor
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode; 
  subValue?: string; 
  glowClass?: string;
  valueColor?: string;
  subValueColor?: string;
}) {
  return (
    <div className={cn(
      "bg-card/40 backdrop-blur-[10px] border border-white/5 p-8 rounded-[2rem] transition-all duration-500 group",
      glowClass || "hover:border-white/20"
    )}>
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-30 group-hover:opacity-60 transition-opacity">{label}</span>
        <div className={cn("opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100", valueColor)}>{icon}</div>
      </div>
      <div className={cn("text-4xl font-serif italic tracking-tighter transition-colors duration-500", valueColor)}>{value}</div>
      {subValue && <div className={cn("text-[9px] font-mono font-bold uppercase tracking-widest opacity-40 mt-4 leading-relaxed", subValueColor)}>{subValue}</div>}
    </div>
  );
}
