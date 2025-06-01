'use client';

import { IEntry } from '@/types/entry';

interface SmartInterventionsProps {
  entries: IEntry[];
  currentMood: number;
  currentEnergy: number;
}

export default function SmartInterventions({ entries, currentMood, currentEnergy }: SmartInterventionsProps) {
  const getTraumaInformedSuggestions = () => {
    const recentEntries = entries.slice(0, 7);
    const avgMood = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
    
    // Detect trauma patterns
    const anxietyTags = recentEntries.filter(entry => 
      entry.tags.some(tag => ['anxiety', 'overwhelm', 'panic', 'stress'].includes(tag.toLowerCase()))
    );
    
    const isolationPattern = recentEntries.filter(entry => 
      entry.tags.some(tag => ['alone', 'isolated', 'withdrawn', 'lonely'].includes(tag.toLowerCase()))
    );
    
    const triggerWords = recentEntries.filter(entry => 
      entry.note.toLowerCase().includes('triggered') || 
      entry.note.toLowerCase().includes('upset') ||
      entry.note.toLowerCase().includes('angry')
    );

    // eslint-disable-next-line prefer-const
    let suggestions = [];

    // Trauma-informed interventions
    if (currentMood < avgMood - 2) {
      suggestions.push(
        { 
          type: 'immediate', 
          text: '🌱 Ground yourself: Name 5 things you see, 4 you hear, 3 you touch', 
          confidence: 'high',
          category: 'grounding'
        },
        { 
          type: 'healing', 
          text: '💝 Self-compassion: "This feeling is temporary, I am safe right now"', 
          confidence: 'high',
          category: 'self-compassion'
        }
      );
    }

    if (anxietyTags.length >= 2) {
      suggestions.push({
        type: 'pattern',
        text: '🔄 Anxiety pattern detected - consider trauma-informed breathwork',
        confidence: 'medium',
        category: 'pattern-awareness'
      });
    }

    if (isolationPattern.length >= 2) {
      suggestions.push({
        type: 'connection',
        text: '🤝 Isolation pattern detected - gentle social connection may help healing',
        confidence: 'medium',
        category: 'social-healing'
      });
    }

    if (triggerWords.length >= 1) {
      suggestions.push({
        type: 'trauma-work',
        text: '🧘 Emotional activation noticed - practice RAIN technique (Recognize, Allow, Investigate, Nurture)',
        confidence: 'high',
        category: 'trauma-processing'
      });
    }

    // Add energy-based suggestions
    if (currentEnergy < 4) {
      suggestions.push({
        type: 'restoration',
        text: '⚡ Low energy may indicate nervous system fatigue - prioritize rest',
        confidence: 'medium',
        category: 'nervous-system'
      });
    }

    return suggestions.slice(0, 4); // Limit to prevent overwhelm
  };

  const suggestions = getTraumaInformedSuggestions();

  if (suggestions.length === 0) return null;

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'grounding': '🌱',
      'self-compassion': '💝',
      'pattern-awareness': '🔄',
      'social-healing': '🤝',
      'trauma-processing': '🧘',
      'nervous-system': '⚡',
      'default': '✨'
    };
    return emojiMap[category] || emojiMap.default;
  };

  return (
    <div className="bg-[var(--color-accent)] bg-opacity-10 border border-[var(--color-accent)] p-6 rounded-xl mb-6 glow-soft">
      <h3 className="text-[var(--color-accent)] font-semibold mb-4 flex items-center">
        <span className="mr-2">🌟</span>
        Healing Guidance (Based on Your Patterns)
      </h3>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="glass p-4 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start space-x-3">
                <span className="text-lg mt-0.5">{getCategoryEmoji(suggestion.category)}</span>
                <div className="flex-1">
                  <p className="text-[var(--color-text-primary)] leading-relaxed">{suggestion.text}</p>
                  <div className="flex items-center mt-2 space-x-3">
                    <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-2 py-1 rounded">
                      {suggestion.confidence} confidence
                    </span>
                    <span className="text-xs text-[var(--color-accent)] capitalize">
                      {suggestion.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-[var(--color-accent)] bg-opacity-5 rounded-lg border border-[var(--color-accent)] border-opacity-20">
        <p className="text-xs text-[var(--color-text-secondary)] italic">
          💫 These suggestions are based on trauma-informed principles. Trust your inner wisdom and take only what serves your healing journey.
        </p>
      </div>
    </div>
  );
}