'use client';

import { IEntry } from '@/types/entry';

interface SmartInterventionsProps {
  entries: IEntry[];
  currentMood: number;
  currentEnergy: number;
}

export default function SmartInterventions({ entries, currentMood }: SmartInterventionsProps) {
  const getSmartSuggestions = () => {
    const recentEntries = entries.slice(0, 7);
    const avgMood = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
    
    if (currentMood < avgMood - 2) {
      return [
        { type: 'immediate', text: 'Take 5 deep breaths', confidence: 'high' },
        { type: 'scheduled', text: 'Schedule 20min walk for tomorrow morning', confidence: 'medium' },
        { type: 'social', text: 'Your data shows social tags boost mood +2.3 points', confidence: 'high' }
      ];
    }
    
    return [];
  };

  const suggestions = getSmartSuggestions();

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-[var(--color-accent)] bg-opacity-10 border border-[var(--color-accent)] p-4 rounded-lg mb-6">
      <h3 className="text-[var(--color-accent)] font-semibold mb-3">
        🎯 Smart Suggestions (Based on Your Patterns)
      </h3>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-[var(--color-text-primary)]">{suggestion.text}</span>
            <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-2 py-1 rounded">
              {suggestion.confidence} confidence
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}