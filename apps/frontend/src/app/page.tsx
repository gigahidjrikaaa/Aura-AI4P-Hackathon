'use client';

import { useState } from 'react';
import { IEntry } from '@/types/entry';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { analyzePatterns, AnalysisResponse } from '@/services/api';
import CheckInForm from '@/components/features/CheckInForm';
import AuraReport from '@/components/features/AuraReport';
import EntryList from '@/components/features/EntryList';

export default function Home() {
  const [entries, setEntries] = useLocalStorage<IEntry[]>('aura-entries', []);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewEntry = (entryData: Omit<IEntry, 'id' | 'date'>) => {
    const newEntry: IEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...entryData,
    };
    setEntries([newEntry, ...entries]);
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

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--color-accent)] mb-4">
            Aura
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg">
            Your private emotional weather forecast
          </p>
        </header>

        {/* Check-in Form */}
        <div className="mb-12">
          <CheckInForm onSubmit={handleNewEntry} />
        </div>

        {/* Actions */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleRevealAura}
            disabled={isAnalyzing || entries.length < 3}
            className="bg-[var(--color-accent)] text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isAnalyzing ? 'Revealing Your Aura...' : 'Reveal My Aura'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-[var(--color-error)] text-white p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Analysis Report */}
        {analysis && (
          <div className="mb-12">
            <AuraReport analysis={analysis} />
          </div>
        )}

        {/* Entry List */}
        <div>
          <EntryList entries={entries} />
        </div>
      </div>
    </div>
  );
}
