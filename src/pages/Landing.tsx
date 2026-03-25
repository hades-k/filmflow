import React from 'react';
import { Film, Clock, TrendingUp, BarChart3, Users, Zap, Shield, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-bg text-accent overflow-x-hidden w-full max-w-full">
      {/* Floating Navigation */}
      <nav className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50">
        <div className="max-w-7xl mx-auto bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="FilmFlow Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded shadow-sm" />
            <span className="text-lg sm:text-xl font-serif italic tracking-tight">FilmFlow</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif italic tracking-tighter mb-6 leading-tight">
              Stop Wasting Time<br />
              <span className="text-accent/60">Choosing What to Watch</span>
            </h1>
            <p className="text-base sm:text-xl text-accent/70 mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Track your decision-making patterns, identify fatigue, and make faster choices with data-driven insights.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-accent text-bg px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-white/10 cursor-pointer flex items-center gap-2 mx-auto"
            >
              Start Now <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-transparent to-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight mb-4">
              Decision Analytics Engine
            </h2>
            <p className="text-accent/60 text-base sm:text-lg px-4">
              Understand your patterns, reduce fatigue, make better choices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: <Clock className="w-6 h-6" />,
                title: 'Track Every Decision',
                description: 'Log how long it takes to choose what to watch. See patterns emerge over time.'
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Trend Analysis',
                description: 'Are you getting faster or slower? Linear regression reveals your decision velocity.'
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Fatigue Score',
                description: 'Know when decision fatigue is setting in. Take action before it impacts your choices.'
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Household Sharing',
                description: 'Share data with family members. See collective patterns and make group decisions faster.'
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'The Scroll Toll',
                description: 'See the cumulative time wasted. A sobering metric that motivates faster decisions.'
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Privacy First',
                description: 'Your data stays yours. Secure Firebase backend with household-level permissions.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card/40 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-accent/20 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-serif italic mb-2">{feature.title}</h3>
                <p className="text-accent/60 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="FilmFlow Logo" className="w-5 h-5 rounded shadow-sm" />
            <span className="font-serif italic">FilmFlow</span>
          </div>
          <div className="text-xs text-accent/40 uppercase tracking-widest text-center">
            FilmFlow. Decision Analytics Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
