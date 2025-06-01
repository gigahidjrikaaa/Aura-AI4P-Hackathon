'use client';

import { useState, useEffect } from 'react';
import { IEntry } from '@/types/entry';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { analyzePatterns, AnalysisResponse } from '@/services/api';
import CheckInForm from '@/components/features/CheckInForm';
import AuraReport from '@/components/features/AuraReport';
import EntryList from '@/components/features/EntryList';
import MomentumIndicator from '@/components/features/MomentumIndicator';
import SmartInterventions from '@/components/features/SmartInterventions';
import MicroMomentCapture from '@/components/features/MicroMomentCapture';
import DailyHealing from '@/components/features/DailyHealing';
import PatternStrength from '@/components/features/PatternStrength';
import EmotionalForecast from '@/components/features/EmotionalForecast';

export default function Home() {
  const [entries, setEntries] = useLocalStorage<IEntry[]>('aura-entries', []);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState(5);
  const [currentEnergy, setCurrentEnergy] = useState(5);

  // Create dynamic stars on component mount
  useEffect(() => {
    const createStars = () => {
      const starsContainer = document.querySelector('.stars-container');
      if (!starsContainer) return;

      // Clear existing stars
      starsContainer.innerHTML = '';

      // Create regular stars
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        const size = Math.random();
        
        if (size < 0.7) {
          star.className = 'star star-small';
        } else if (size < 0.9) {
          star.className = 'star star-medium';
        } else {
          star.className = 'star star-large';
        }
        
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.animationDuration = (1 + Math.random() * 2) + 's';
        
        starsContainer.appendChild(star);
      }

      // Create shooting stars
      for (let i = 0; i < 3; i++) {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        shootingStar.style.top = Math.random() * 50 + '%';
        shootingStar.style.left = '-100px';
        shootingStar.style.animationDelay = Math.random() * 10 + 's';
        shootingStar.style.animationDuration = (2 + Math.random() * 3) + 's';
        
        starsContainer.appendChild(shootingStar);
      }
    };

    createStars();
  }, []);

  const handleNewEntry = (entryData: Omit<IEntry, 'id' | 'date'>) => {
    const newEntry: IEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...entryData,
    };
    setEntries([newEntry, ...entries]);
    setCurrentMood(entryData.mood);
    setCurrentEnergy(entryData.energy);
  };

  const handleRevealAura = async () => {
    if (entries.length < 3) {
      setError('You need at least 3 entries to reveal your Aura patterns.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzePatterns(entries);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze patterns');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getAuraQuote = () => {
    const quotes = [
      "The quieter you become, the more you are able to hear.",
      "Peace comes from within. Do not seek it without.",
      "Your emotional journey is uniquely yours.",
      "Understanding patterns creates possibilities.",
      "Every feeling carries wisdom when observed mindfully.",
      "In the cosmic dance of emotions, find your rhythm.",
      "Like stars in the night sky, your feelings have their own constellation."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] relative overflow-x-hidden">
      {/* Cosmic Background Elements */}
      <div className="stars-container"></div>
      
      {/* Nebula clouds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="nebula nebula-1"></div>
        <div className="nebula nebula-2"></div>
      </div>

      {/* Distant planets */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="planet planet-1"></div>
        <div className="planet planet-2"></div>
        <div className="planet planet-3"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Cosmic Header */}
        <header className="text-center mb-16">
          <div className="mb-8">
            <div className="inline-block p-10 rounded-full glass glow-cosmic breathe">
              <div className="text-center">
                <h1 className="text-6xl font-light cosmic-text mb-3 tracking-wide">
                  Aura
                </h1>
                <div className="text-lg text-[var(--color-accent-soft)] font-light tracking-wide">
                  AI-Powered Emotional Intelligence
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <p className="text-[var(--color-text-secondary)] text-xl font-light">
              {getWelcomeMessage()}, welcome to your cosmic sanctuary
            </p>
            <p className="text-[var(--color-accent)] text-base leading-relaxed">
              Discover hidden patterns in your emotional universe. Track your daily moods, 
              energy levels, and thoughts to reveal insights about your inner cosmos.
            </p>
            <p className="text-[var(--color-accent-soft)] text-sm italic max-w-md mx-auto">
              &quot;{getAuraQuote()}&quot;
            </p>
          </div>
        </header>

        {/* Momentum Indicator */}
        {entries.length >= 3 && (
          <div className="mb-12">
            <MomentumIndicator entries={entries} />
          </div>
        )}

        {/* Daily Healing Wisdom */}
        <DailyHealing />

        {/* Pattern Strength Analysis */}
        {entries.length >= 5 && (
          <PatternStrength entries={entries} />
        )}

        {/* Smart Interventions */}
        {entries.length > 0 && (
          <SmartInterventions 
            entries={entries} 
            currentMood={currentMood} 
            currentEnergy={currentEnergy} 
          />
        )}

        {/* Emotional Forecast */}
        {entries.length >= 7 && (
          <EmotionalForecast entries={entries} />
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Check-in Form - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="glass p-8 rounded-2xl glow-soft">
              <CheckInForm onSubmit={handleNewEntry} />
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            {/* Journey Stats */}
            <div className="glass p-6 rounded-xl glow-soft">
              <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
                <span className="mr-2">🌌</span>
                Your Cosmic Journey
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)] text-sm">Total Check-ins</span>
                  <span className="text-[var(--color-text-primary)] font-medium">{entries.length}</span>
                </div>
                {entries.length > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-secondary)] text-sm">Days Tracked</span>
                      <span className="text-[var(--color-text-primary)] font-medium">
                        {new Set(entries.map(e => e.date.split('T')[0])).size}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-secondary)] text-sm">Latest Mood</span>
                      <span className="text-[var(--color-accent)] font-medium">{entries[0]?.mood}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-secondary)] text-sm">Latest Energy</span>
                      <span className="text-[var(--color-success)] font-medium">{entries[0]?.energy}/10</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Pattern Insights Preview */}
            {entries.length >= 2 && (
              <div className="glass p-6 rounded-xl glow-soft">
                <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
                  <span className="mr-2">🔮</span>
                  Constellation Insight
                </h3>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {(() => {
                    const recentEntries = entries.slice(0, 3);
                    const avgMood = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
                    const trend = entries[0]?.mood > avgMood ? "ascending" : entries[0]?.mood < avgMood ? "descending" : "stable";
                    return (
                      <p>
                        Your emotional constellation appears <span className="text-[var(--color-accent)]">{trend}</span> based on recent observations.
                        {entries.length >= 3 && " Ready to map your emotional universe?"}
                      </p>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Aura Revelation Section */}
        <div className="text-center mb-12">
          <div className="glass p-8 rounded-2xl glow-medium relative overflow-hidden">
            {/* Cosmic overlay effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-4 left-4 w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-8 w-1 h-1 bg-[var(--color-accent-soft)] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-6 left-12 w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            
            <h2 className="text-2xl font-light text-[var(--color-accent)] mb-4">
              🌠 Discover Your Emotional Universe
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6 max-w-2xl mx-auto leading-relaxed">
              When you&apos;re ready, let our AI constellation mapper analyze your emotional journey to reveal 
              hidden patterns, cosmic correlations, and provide your personalized emotional weather forecast 
              from the depths of space.
            </p>
            
            <button
              onClick={handleRevealAura}
              disabled={isAnalyzing || entries.length < 3}
              className={`
                px-12 py-4 rounded-full font-medium text-lg transition-all duration-300 relative
                ${isAnalyzing 
                  ? 'bg-[var(--color-accent)] opacity-75 pulse-glow' 
                  : entries.length >= 3 
                    ? 'bg-[var(--color-accent)] text-white hover:glow-strong hover:scale-105 glow-soft' 
                    : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] cursor-not-allowed'
                }
              `}
            >
              {isAnalyzing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mapping Your Constellation...
                </span>
              ) : entries.length >= 3 ? (
                '🔮 Reveal My Emotional Aura'
              ) : (
                `Add ${3 - entries.length} more star${3 - entries.length > 1 ? 's' : ''} to your constellation`
              )}
            </button>
            
            {entries.length < 3 && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-3 opacity-75">
                Minimum 3 emotional data points needed for cosmic pattern analysis
              </p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass border-[var(--color-error)] bg-[var(--color-error)] bg-opacity-10 text-[var(--color-error)] p-6 rounded-xl mb-8 glow-soft">
            <div className="flex items-center">
              <span className="mr-3 text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Analysis Report */}
        {analysis && (
          <div className="mb-12">
            <div className="glass p-8 rounded-2xl glow-medium">
              <AuraReport analysis={analysis} />
            </div>
          </div>
        )}

        {/* Entry History */}
        {entries.length > 0 && (
          <div className="glass p-8 rounded-2xl glow-soft">
            <EntryList entries={entries} />
          </div>
        )}

        {/* Welcome State */}
        {entries.length === 0 && (
          <div className="text-center py-16">
            <div className="glass p-12 rounded-3xl glow-soft max-w-2xl mx-auto relative">
              {/* Floating cosmic elements */}
              <div className="absolute top-6 right-8 w-3 h-3 bg-[var(--color-accent)] rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute bottom-8 left-6 w-2 h-2 bg-[var(--color-accent-soft)] rounded-full opacity-40 animate-pulse" style={{animationDelay: '1.5s'}}></div>
              
              <div className="text-6xl mb-6 breathe">🌌</div>
              <h2 className="text-2xl font-light text-[var(--color-accent)] mb-4">
                Begin Your Cosmic Journey
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                Welcome to Aura, your private cosmic sanctuary for emotional discovery. 
                Start by recording your first emotional data point above. Every entry becomes 
                a star in your personal constellation, helping reveal the hidden patterns 
                of your emotional universe.
              </p>
              <div className="space-y-2 text-sm text-[var(--color-text-secondary)] opacity-75">
                <p>✨ Your data remains in your personal space - completely private</p>
                <p>🌟 Emotional patterns emerge after just 3 stellar observations</p>
                <p>🔮 AI provides cosmic insights tailored to your unique constellation</p>
                <p>🚀 Track moods, energy, and thoughts across time and space</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Micro-Moment Capture */}
      <MicroMomentCapture />
    </div>
  );
}
