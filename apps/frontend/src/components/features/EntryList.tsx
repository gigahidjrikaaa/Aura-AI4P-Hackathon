'use client';

import { IEntry } from '@/types/entry';

interface EntryListProps {
  entries: IEntry[];
}

export default function EntryList({ entries }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] p-6 rounded-lg text-center">
        <p className="text-[var(--color-text-secondary)]">
          No entries yet. Start your journey by adding your first check-in above.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-[var(--color-text-primary)]">
        Your Journey ({entries.length} entries)
      </h2>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="border border-[var(--color-text-secondary)] rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <div className="flex gap-4 text-sm">
                <span className="text-[var(--color-accent)]">
                  Mood: {entry.mood}/10
                </span>
                <span className="text-[var(--color-success)]">
                  Energy: {entry.energy}/10
                </span>
              </div>
            </div>
            
            {entry.note && (
              <p className="text-[var(--color-text-primary)] mb-2">
                {entry.note}
              </p>
            )}
            
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[var(--color-accent)] text-white text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}