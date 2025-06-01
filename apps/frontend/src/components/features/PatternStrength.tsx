'use client';

import { IEntry } from '@/types/entry';

interface PatternStrengthProps {
  entries: IEntry[];
}

interface PatternInsight {
  name: string;
  strength: number;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  actionable: string;
}

export default function PatternStrength({ entries }: PatternStrengthProps) {
  const analyzePatterns = (): PatternInsight[] => {
    if (entries.length < 5) return [];

    const patterns: PatternInsight[] = [];
    
    // Analyze mood-energy correlation
    const moodEnergyCorrelation = calculateMoodEnergyCorrelation(entries);
    if (moodEnergyCorrelation.strength > 0.3) {
      patterns.push({
        name: "Mood-Energy Sync",
        strength: moodEnergyCorrelation.strength * 10,
        description: moodEnergyCorrelation.description,
        confidence: moodEnergyCorrelation.strength > 0.7 ? 'high' : moodEnergyCorrelation.strength > 0.5 ? 'medium' : 'low',
        actionable: "When you boost energy, mood follows. Focus on energy-building activities during low periods."
      });
    }

    // Analyze tag patterns
    const tagPatterns = analyzeTagInfluence(entries);
    patterns.push(...tagPatterns);

    // Analyze temporal patterns
    const temporalPatterns = analyzeTemporalPatterns(entries);
    patterns.push(...temporalPatterns);

    return patterns.slice(0, 4); // Limit to most significant patterns
  };

  const calculateMoodEnergyCorrelation = (entries: IEntry[]) => {
    const pairs = entries.map(e => ({ mood: e.mood, energy: e.energy }));
    const correlation = calculateCorrelation(pairs.map(p => p.mood), pairs.map(p => p.energy));
    
    return {
      strength: Math.abs(correlation),
      description: correlation > 0.7 ? "Strong positive sync between mood and energy" :
                   correlation > 0.3 ? "Moderate connection between mood and energy" :
                   "Mood and energy operate independently"
    };
  };

  const analyzeTagInfluence = (entries: IEntry[]): PatternInsight[] => {
    const tagImpacts: { [tag: string]: { moodDiff: number, count: number } } = {};
    
    entries.forEach(entry => {
      const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
      const moodDiff = entry.mood - avgMood;
      
      entry.tags.forEach(tag => {
        if (!tagImpacts[tag]) tagImpacts[tag] = { moodDiff: 0, count: 0 };
        tagImpacts[tag].moodDiff += moodDiff;
        tagImpacts[tag].count += 1;
      });
    });

    return Object.entries(tagImpacts)
      .filter(([, data]) => data.count >= 2) // Skips the key, as it's unused in the filter
      .map(([tag, data]) => {
        const avgImpact = data.moodDiff / data.count;
        const strength = Math.abs(avgImpact) * 2;
        
        return {
          name: `"${tag}" Impact`,
          strength: Math.min(strength, 10),
          description: avgImpact > 0 ? `"${tag}" consistently boosts your mood (+${avgImpact.toFixed(1)})` :
                       `"${tag}" tends to lower your mood (${avgImpact.toFixed(1)})`,
          confidence: (data.count >= 4 ? 'high' : data.count >= 3 ? 'medium' : 'low') as PatternInsight['confidence'],
          actionable: avgImpact > 0 ? `Schedule more "${tag}" activities when mood is low` :
                      `Prepare coping strategies before "${tag}" events`
        };
      })
      .filter(pattern => pattern.strength > 2)
      .sort((a, b) => b.strength - a.strength);
  };

  const analyzeTemporalPatterns = (entries: IEntry[]): PatternInsight[] => {
    const dayOfWeek = entries.map(e => ({
      day: new Date(e.date).getDay(),
      mood: e.mood
    }));

    const dayAverages = Array(7).fill(0).map((_, day) => {
      const dayEntries = dayOfWeek.filter(e => e.day === day);
      return dayEntries.length > 0 ? dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length : 0;
    });

    const maxDay = dayAverages.indexOf(Math.max(...dayAverages));
    const minDay = dayAverages.indexOf(Math.min(...dayAverages));
    const difference = Math.max(...dayAverages) - Math.min(...dayAverages);

    if (difference > 1.5) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return [{
        name: "Weekly Rhythm",
        strength: difference * 2,
        description: `Your mood peaks on ${dayNames[maxDay]} and dips on ${dayNames[minDay]}`,
        confidence: 'medium',
        actionable: `Plan important activities for ${dayNames[maxDay]}, schedule self-care on ${dayNames[minDay]}`
      }];
    }

    return [];
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  };

  const patterns = analyzePatterns();

  if (patterns.length === 0) return null;

  const getStrengthColor = (strength: number) => {
    if (strength >= 7) return 'text-[var(--color-success)]';
    if (strength >= 4) return 'text-[var(--color-warning)]';
    return 'text-[var(--color-text-secondary)]';
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return '🎯';
      case 'medium': return '🔍';
      case 'low': return '💡';
      default: return '✨';
    }
  };

  return (
    <div className="glass p-6 rounded-xl glow-soft mb-6">
      <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Pattern Strength Analysis
      </h3>
      
      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <div key={index} className="border border-[var(--color-accent)] border-opacity-20 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{getConfidenceIcon(pattern.confidence)}</span>
                <h4 className="font-medium text-[var(--color-text-primary)]">{pattern.name}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getStrengthColor(pattern.strength)}`}>
                  {pattern.strength.toFixed(1)}/10
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] capitalize">
                  {pattern.confidence}
                </span>
              </div>
            </div>
            
            {/* Strength bar */}
            <div className="w-full bg-[var(--color-surface)] rounded-full h-2 mb-3">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-success)]"
                style={{ width: `${Math.min(pattern.strength * 10, 100)}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">
              {pattern.description}
            </p>
            
            <div className="bg-[var(--color-accent)] bg-opacity-5 rounded p-3">
              <p className="text-xs text-[var(--color-text-primary)]">
                <strong>💡 Actionable Insight:</strong> {pattern.actionable}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}