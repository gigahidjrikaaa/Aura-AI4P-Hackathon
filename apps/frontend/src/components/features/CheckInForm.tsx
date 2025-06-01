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

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-[var(--color-text-primary)]">
        Daily Check-in
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Slider */}
        <div>
          <label htmlFor="mood-slider" className="block text-[var(--color-text-primary)] font-medium mb-2">
            Mood: {mood}/10
          </label>
          <input
            id="mood-slider"
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full h-2 bg-[var(--color-background)] rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
        {/* Energy Slider */}
        <div>
          <label htmlFor="energy-slider" className="block text-[var(--color-text-primary)] font-medium mb-2">
            Energy: {energy}/10
          </label>
          <input
            id="energy-slider"
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full h-2 bg-[var(--color-background)] rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
        {/* Note Input */}
        <div>
          <label htmlFor="note-input" className="block text-[var(--color-text-primary)] font-medium mb-2">
            Note (optional)
          </label>
          <textarea
            id="note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How are you feeling today? Any highlights or challenges?"
            className="w-full px-3 py-2 bg-[var(--color-background)] text-[var(--color-text-primary)] border border-[var(--color-text-secondary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] resize-none"
            rows={3}
          />
        </div>
        {/* Tags Input */}
        <div>
          <label htmlFor="tags-input" className="block text-[var(--color-text-primary)] font-medium mb-2">
            Tags (optional)
          </label>
          <input
            id="tags-input"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="work, exercise, social, poor-sleep (comma-separated)"
            className="w-full px-3 py-2 bg-[var(--color-background)] text-[var(--color-text-primary)] border border-[var(--color-text-secondary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[var(--color-accent)] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Save Check-in
        </button>
      </form>
    </div>
  );
}