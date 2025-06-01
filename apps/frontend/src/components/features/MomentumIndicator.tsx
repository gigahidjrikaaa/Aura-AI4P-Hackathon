'use client';

import { IEntry } from '@/types/entry';

interface MomentumIndicatorProps {
  entries: IEntry[];
}

export default function MomentumIndicator({ entries }: MomentumIndicatorProps) {
  const calculateMomentum = () => {
    if (entries.length < 3) return null;
    
    const recent = entries.slice(0, 3);
    const moodTrend = recent[0].mood - recent[2].mood;
    const energyTrend = recent[0].energy - recent[2].energy;
    
    const momentum = (moodTrend + energyTrend) / 2;
    
    return {
      value: momentum,
      direction: momentum > 0 ? 'ascending' : momentum < 0 ? 'descending' : 'stable',
      strength: Math.abs(momentum) > 2 ? 'strong' : Math.abs(momentum) > 1 ? 'moderate' : 'weak'
    };
  };

  const momentum = calculateMomentum();
  if (!momentum) return null;

  const getEmoji = () => {
    if (momentum.direction === 'ascending') return '📈';
    if (momentum.direction === 'descending') return '📉';
    return '➡️';
  };

  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center bg-[var(--color-surface)] px-6 py-3 rounded-full">
        <span className="text-2xl mr-3">{getEmoji()}</span>
        <div>
          <span className="text-[var(--color-text-primary)] font-medium">
            {momentum.strength} {momentum.direction} momentum
          </span>
          <div className="text-sm text-[var(--color-text-secondary)]">
            {momentum.value > 0 ? '+' : ''}{momentum.value.toFixed(1)} points over 3 days
          </div>
        </div>
      </div>
    </div>
  );
}