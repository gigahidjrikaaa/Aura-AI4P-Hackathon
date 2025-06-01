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
import CorrelationMatrix from '@/components/features/CorrelationMatrix';
import DetailedStatistics from '@/components/features/DetailedStatistics';
import PatternConfidenceScoring from '@/components/features/PatternConfidenceScoring';
import AdvancedForecasting from '@/components/features/AdvancedForecasting';
import DataExportTools from '@/components/features/DataExportTools';

// Define user journey stages for progressive disclosure
type UserJourneyStage = 'newcomer' | 'explorer' | 'tracker' | 'analyzer' | 'master';

export default function Home() {
  const [entries, setEntries] = useLocalStorage<IEntry[]>('aura-entries', []);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState(5);
  const [currentEnergy, setCurrentEnergy] = useState(5);
  const [activeTab, setActiveTab] = useState<'check-in' | 'insights' | 'history'>('check-in');
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration by ensuring client-side rendering for time-dependent content
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine user's journey stage based on their data
  const getUserJourneyStage = (): UserJourneyStage => {
    if (entries.length === 0) return 'newcomer';
    if (entries.length < 3) return 'explorer';
    if (entries.length < 7) return 'tracker';
    if (entries.length < 14) return 'analyzer';
    return 'master';
  };

  const journeyStage = getUserJourneyStage();

  // Progressive disclosure: show features based on user's journey
  const getVisibleFeatures = () => {
    const features = {
      dailyHealing: journeyStage !== 'newcomer',
      momentum: journeyStage !== 'newcomer' && journeyStage !== 'explorer',
      smartInterventions: journeyStage !== 'newcomer' && entries.length > 0,
      patternStrength: journeyStage === 'analyzer' || journeyStage === 'master',
      emotionalForecast: journeyStage === 'master',
      auraAnalysis: journeyStage !== 'newcomer' && journeyStage !== 'explorer'
    };
    return features;
  };

  const visibleFeatures = getVisibleFeatures();

  // Create dynamic stars on component mount
  useEffect(() => {
    const createStars = () => {
      const starsContainer = document.querySelector('.stars-container');
      if (!starsContainer) return;

      starsContainer.innerHTML = '';

      // Create fewer, more purposeful stars to reduce visual noise
      for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        const size = Math.random();
        
        if (size < 0.8) {
          star.className = 'star star-small';
        } else {
          star.className = 'star star-medium';
        }
        
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';
        
        starsContainer.appendChild(star);
      }

      // Single shooting star for subtlety
      const shootingStar = document.createElement('div');
      shootingStar.className = 'shooting-star';
      shootingStar.style.top = '20%';
      shootingStar.style.left = '-100px';
      shootingStar.style.animationDelay = '5s';
      shootingStar.style.animationDuration = '3s';
      
      starsContainer.appendChild(shootingStar);
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
    
    // Auto-navigate to insights after first few entries
    if (entries.length >= 2) {
      setActiveTab('insights');
    }
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
      setActiveTab('insights');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze patterns');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPersonalizedWelcome = () => {
    // Return a default message during SSR, update on client
    if (!isClient) {
      return "Welcome to your emotional universe.";
    }

    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    
    const stageMessages = {
      newcomer: `${timeGreeting}. Ready to explore your emotional universe?`,
      explorer: `${timeGreeting}. Your constellation is taking shape.`,
      tracker: `${timeGreeting}. Your emotional patterns are emerging.`,
      analyzer: `${timeGreeting}. Your cosmic insights await.`,
      master: `${timeGreeting}, cosmic navigator.`
    };
    
    return stageMessages[journeyStage];
  };

  const getJourneyProgress = () => {
    const milestones = [
      { entries: 1, label: "First Star", description: "Begin your journey" },
      { entries: 3, label: "Constellation", description: "Unlock pattern analysis" },
      { entries: 7, label: "Galaxy", description: "Discover forecasting" },
      { entries: 14, label: "Universe", description: "Master emotional intelligence" }
    ];

    const currentMilestone = milestones.findIndex(m => entries.length < m.entries);
    const completedMilestones = currentMilestone === -1 ? milestones.length : currentMilestone;
    
    return { milestones, completedMilestones, total: milestones.length };
  };

  const progress = getJourneyProgress();

  // Main navigation tabs for better organization
  const renderMainNavigation = () => {
    const tabsConfig = [
      { id: 'check-in', label: 'Check-in', icon: '📝', show: true },
      { id: 'insights', label: 'Insights', icon: '🔮', show: entries.length > 0 },
      { id: 'history', label: 'History', icon: '📊', show: entries.length > 0 },
    ] as const;

    return (
      <div className="flex justify-center mb-8">
        <div className="glass p-2 rounded-xl">
          <div className="flex space-x-2">
            {tabsConfig.filter(tab => tab.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-[var(--color-accent)] text-white glow-soft' 
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Journey progress indicator
  const renderJourneyProgress = () => (
    <div className="glass p-6 rounded-xl glow-soft mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-[var(--color-accent)]">
          Your Cosmic Journey
        </h3>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {entries.length} entries
        </span>
      </div>
      
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="w-full bg-[var(--color-surface)] rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-success)] transition-all duration-500"
            style={{ width: `${(progress.completedMilestones / progress.total) * 100}%` }}
          ></div>
        </div>
        
        {/* Milestone indicators */}
        <div className="flex justify-between text-xs">
          {progress.milestones.map((milestone, index) => (
            <div 
              key={index} 
              className={`text-center ${index < progress.completedMilestones ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}`}
            >
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                index < progress.completedMilestones ? 'bg-[var(--color-success)]' : 'bg-[var(--color-surface)]'
              }`}></div>
              <div className="font-medium">{milestone.label}</div>
              <div className="opacity-75">{milestone.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] relative overflow-x-hidden">
      {/* Simplified Background Elements */}
      <div className="stars-container"></div>
      
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Streamlined Header */}
        <header className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-5xl font-light cosmic-text mb-2 tracking-wide">
              Aura
            </h1>
            <div className="text-base text-[var(--color-accent-soft)] font-light">
              Emotional Intelligence Through AI
            </div>
          </div>
          
          <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
            {getPersonalizedWelcome()}
          </p>
        </header>

        {/* Journey Progress - Always visible for motivation */}
        {renderJourneyProgress()}

        {/* Main Navigation */}
        {renderMainNavigation()}

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Check-in Tab */}
          {activeTab === 'check-in' && (
            <div className="space-y-6">
              {/* Daily Healing - Contextual placement */}
              {visibleFeatures.dailyHealing && <DailyHealing />}
              
              {/* Main Check-in Form */}
              <div className="glass p-8 rounded-2xl glow-soft">
                <CheckInForm onSubmit={handleNewEntry} />
              </div>
              
              {/* Quick Actions */}
              {visibleFeatures.smartInterventions && (
                <SmartInterventions 
                  entries={entries} 
                  currentMood={currentMood} 
                  currentEnergy={currentEnergy} 
                />
              )}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Momentum Indicator */}
              {visibleFeatures.momentum && (
                <MomentumIndicator entries={entries} />
              )}

              {/* Aura Analysis Section */}
              {visibleFeatures.auraAnalysis && (
                <div className="glass p-8 rounded-2xl glow-medium">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-light text-[var(--color-accent)] mb-4">
                      🌠 Your Emotional Universe
                    </h2>
                    <p className="text-[var(--color-text-secondary)] mb-6 max-w-xl mx-auto">
                      Discover hidden patterns and receive personalized insights from your emotional data.
                    </p>
                    
                    <button
                      onClick={handleRevealAura}
                      disabled={isAnalyzing || entries.length < 3}
                      className={`
                        px-8 py-3 rounded-full font-medium transition-all duration-300
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
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </span>
                      ) : entries.length >= 3 ? (
                        '🔮 Reveal Patterns'
                      ) : (
                        `${3 - entries.length} more entries needed`
                      )}
                    </button>
                  </div>

                  {/* Analysis Results */}
                  {analysis && (
                    <div className="mt-8">
                      <AuraReport analysis={analysis} />
                    </div>
                  )}
                </div>
              )}

              {/* Basic Advanced Features - Always show for eligible users */}
              {visibleFeatures.patternStrength && (
                <PatternStrength entries={entries} />
              )}

              {visibleFeatures.emotionalForecast && (
                <EmotionalForecast entries={entries} />
              )}

              {/* Advanced Features Toggle - Show when user has substantial data */}
              {journeyStage === 'master' && entries.length >= 14 && (
                <div className="text-center mb-6">
                  <button
                    onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                    className={`
                      px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center mx-auto
                      ${showAdvancedFeatures 
                        ? 'bg-[var(--color-accent)] text-white glow-soft' 
                        : 'glass hover:bg-[var(--color-surface)] text-[var(--color-accent)]'
                      }
                    `}
                  >
                    <span className="mr-2">
                      {showAdvancedFeatures ? '🔬' : '🧪'}
                    </span>
                    {showAdvancedFeatures ? 'Hide Expert Mode' : 'Unlock Expert Mode'}
                    <span className="ml-2 text-xs opacity-75">
                      ({entries.length} entries)
                    </span>
                  </button>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                    Deep-dive analytics and experimental features
                  </p>
                </div>
              )}

              {/* Expert Mode Features - Only show when toggled */}
              {showAdvancedFeatures && journeyStage === 'master' && (
                <div className="space-y-6">
                  {/* Correlation Matrix */}
                  <CorrelationMatrix entries={entries} />
                  
                  {/* Detailed Statistics */}
                  <DetailedStatistics entries={entries} />
                  
                  {/* Pattern Confidence Scoring */}
                  <PatternConfidenceScoring entries={entries} />
                  
                  {/* Advanced Forecasting */}
                  <AdvancedForecasting entries={entries} />
                  
                  {/* Data Export Options */}
                  <DataExportTools entries={entries} />
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && entries.length > 0 && (
            <div className="glass p-8 rounded-2xl glow-soft">
              <EntryList entries={entries} />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass border-[var(--color-error)] bg-[var(--color-error)] bg-opacity-10 text-[var(--color-error)] p-4 rounded-xl mt-6">
            <div className="flex items-center">
              <span className="mr-3">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Newcomer Welcome State */}
        {journeyStage === 'newcomer' && (
          <div className="text-center py-12 mt-8">
            <div className="glass p-8 rounded-2xl glow-soft max-w-xl mx-auto">
              <div className="text-4xl mb-4">🌌</div>
              <h2 className="text-xl font-light text-[var(--color-accent)] mb-3">
                Welcome to Your Emotional Universe
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6 text-sm leading-relaxed">
                Start by completing your first check-in above. Each entry becomes a star 
                in your personal constellation, revealing patterns in your emotional journey.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center">
                  <span className="mr-2">🔒</span>
                  <span>Completely Private</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🧠</span>
                  <span>AI-Powered Insights</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📈</span>
                  <span>Pattern Recognition</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🌟</span>
                  <span>Personal Growth</span>
                </div>
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
