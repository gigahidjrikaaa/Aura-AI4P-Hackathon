'use client';

import { useState } from 'react';
import { IEntry } from '@/types/entry';

interface CheckInFormProps {
  onSubmit: (entry: Omit<IEntry, 'id' | 'date'>) => void;
}

export default function CheckInForm({ onSubmit }: CheckInFormProps) {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onSubmit({
      mood,
      energy,
      note,
      tags,
    });

    // Reset form
    setMood(5);
    setEnergy(5);
    setNote('');
    setTagsInput('');
  };

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return '😔';
    if (value <= 4) return '😐';
    if (value <= 6) return '🙂';
    if (value <= 8) return '😊';
    return '😄';
  };

  const getEnergyEmoji = (value: number) => {
    if (value <= 2) return '🪫';
    if (value <= 4) return '🔋';
    if (value <= 6) return '⚡';
    if (value <= 8) return '✨';
    return '🌟';
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <div className="p-3 rounded-full bg-[var(--color-accent)] bg-opacity-20 glow-soft mr-4">
          <span className="text-2xl">📝</span>
        </div>
        <div>
          <h2 className="text-2xl font-light text-[var(--color-text-primary)] mb-1">
            Daily Reflection
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Take a moment to check in with yourself
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mood Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="mood-slider" className="text-[var(--color-text-primary)] font-medium flex items-center">
              <span className="text-2xl mr-3">{getMoodEmoji(mood)}</span>
              Mood
            </label>
            <div className="text-[var(--color-accent)] font-medium text-lg">
              {mood}/10
            </div>
          </div>
          
          <div className="relative">
            <input
              id="mood-slider"
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full slider"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-2 px-1">
              <span>Struggling</span>
              <span>Neutral</span>
              <span>Thriving</span>
            </div>
          </div>
        </div>
        {/* Energy Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="energy-slider" className="text-[var(--color-text-primary)] font-medium flex items-center">
              <span className="text-2xl mr-3">{getEnergyEmoji(energy)}</span>
              Energy
            </label>
            <div className="text-[var(--color-success)] font-medium text-lg">
              {energy}/10
            </div>
          </div>
          
          <div className="relative">
            <input
              id="energy-slider"
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full slider"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-2 px-1">
              <span>Drained</span>
              <span>Drained</span>
              <span>Balanced</span>
              <span>Energized</span>
            </div>
          </div>
        </div>
        {/* Note Input */}
        <div className="space-y-3">
          <label htmlFor="note-input" className="block text-[var(--color-text-primary)] font-medium">
          </label>
          <textarea
            id="note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind? Any highlights, challenges, or observations from today..."
            className="w-full px-4 py-3 bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-accent)] border-opacity-20 rounded-xl focus:outline-none focus:border-[var(--color-accent)] focus:glow-soft transition-all duration-200 resize-none"
            rows={3}
          ></textarea>
        </div>
        {/* Tags Input */}
        <div className="space-y-3">
          <label htmlFor="tags-input" className="block text-[var(--color-text-primary)] font-medium">
            Context Tags (optional)
          </label>
          <input
            id="tags-input"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="work, exercise, social, travel, stress, celebration..."
            className="w-full px-4 py-3 bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-accent)] border-opacity-20 rounded-xl focus:outline-none focus:border-[var(--color-accent)] focus:glow-soft transition-all duration-200"
          />
          <p className="text-xs text-[var(--color-text-secondary)] opacity-75">
            Add comma-separated tags to help identify patterns
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-[var(--color-accent)] text-white py-4 rounded-xl font-medium text-lg hover:glow-medium hover:bg-opacity-90 transition-all duration-300 glow-soft"
          >
            <span className="flex items-center justify-center">
              <span className="mr-2">✨</span>
              Save Check-in
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}