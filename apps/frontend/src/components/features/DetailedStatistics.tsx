'use client';

import { IEntry } from '@/types/entry';

interface DetailedStatisticsProps {
  entries: IEntry[];
}

export default function DetailedStatistics({ entries }: DetailedStatisticsProps) {
  const calculateStats = () => {
    const moods = entries.map(e => e.mood);
    const energies = entries.map(e => e.energy);
    
    return {
      mood: {
        mean: moods.reduce((a, b) => a + b, 0) / moods.length,
        median: [...moods].sort((a, b) => a - b)[Math.floor(moods.length / 2)],
        std: Math.sqrt(moods.reduce((sum, val) => sum + Math.pow(val - (moods.reduce((a, b) => a + b, 0) / moods.length), 2), 0) / moods.length),
        min: Math.min(...moods),
        max: Math.max(...moods)
      },
      energy: {
        mean: energies.reduce((a, b) => a + b, 0) / energies.length,
        median: [...energies].sort((a, b) => a - b)[Math.floor(energies.length / 2)],
        std: Math.sqrt(energies.reduce((sum, val) => sum + Math.pow(val - (energies.reduce((a, b) => a + b, 0) / energies.length), 2), 0) / energies.length),
        min: Math.min(...energies),
        max: Math.max(...energies)
      },
      streaks: calculateStreaks(),
      volatility: calculateVolatility()
    };
  };

  const calculateStreaks = () => {
    let currentPositiveStreak = 0;
    let maxPositiveStreak = 0;
    let currentNegativeStreak = 0;
    let maxNegativeStreak = 0;
    
    entries.forEach(entry => {
      if (entry.mood >= 6) {
        currentPositiveStreak++;
        maxPositiveStreak = Math.max(maxPositiveStreak, currentPositiveStreak);
        currentNegativeStreak = 0;
      } else if (entry.mood <= 4) {
        currentNegativeStreak++;
        maxNegativeStreak = Math.max(maxNegativeStreak, currentNegativeStreak);
        currentPositiveStreak = 0;
      } else {
        currentPositiveStreak = 0;
        currentNegativeStreak = 0;
      }
    });
    
    return { maxPositive: maxPositiveStreak, maxNegative: maxNegativeStreak };
  };

  const calculateVolatility = () => {
    const moodChanges = [];
    for (let i = 1; i < entries.length; i++) {
      moodChanges.push(Math.abs(entries[i-1].mood - entries[i].mood));
    }
    return moodChanges.reduce((a, b) => a + b, 0) / moodChanges.length;
  };

  const stats = calculateStats();

  return (
    <div className="glass p-6 rounded-xl glow-soft">
      <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
        <span className="mr-2">📈</span>
        Statistical Deep Dive
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mood Statistics */}
        <div className="space-y-4">
          <h4 className="font-medium text-[var(--color-text-primary)]">Mood Analytics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Mean:</span>
              <span className="font-mono">{stats.mood.mean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Median:</span>
              <span className="font-mono">{stats.mood.median}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Std Dev:</span>
              <span className="font-mono">{stats.mood.std.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Range:</span>
              <span className="font-mono">{stats.mood.min} - {stats.mood.max}</span>
            </div>
          </div>
        </div>
        
        {/* Energy Statistics */}
        <div className="space-y-4">
          <h4 className="font-medium text-[var(--color-text-primary)]">Energy Analytics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Mean:</span>
              <span className="font-mono">{stats.energy.mean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Median:</span>
              <span className="font-mono">{stats.energy.median}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Std Dev:</span>
              <span className="font-mono">{stats.energy.std.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Range:</span>
              <span className="font-mono">{stats.energy.min} - {stats.energy.max}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Metrics */}
      <div className="mt-6 pt-6 border-t border-[var(--color-surface)]">
        <h4 className="font-medium text-[var(--color-text-primary)] mb-4">Advanced Metrics</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-mono text-[var(--color-success)]">{stats.streaks.maxPositive}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Max Positive Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-[var(--color-warning)]">{stats.streaks.maxNegative}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Max Negative Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-[var(--color-accent)]">{stats.volatility.toFixed(2)}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Mood Volatility</div>
          </div>
        </div>
      </div>
    </div>
  );
}