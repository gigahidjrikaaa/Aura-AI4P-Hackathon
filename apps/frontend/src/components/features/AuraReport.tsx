'use client';

import { AnalysisResponse } from '@/services/api';

interface AuraReportProps {
  analysis: AnalysisResponse;
}

export default function AuraReport({ analysis }: AuraReportProps) {
  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Your Aura Report
        </h2>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {analysis.entries_analyzed} entries analyzed
        </span>
      </div>
      
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: analysis.analysis
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/### (.*?)$/gm, '<h3 class="text-xl font-semibold text-[var(--color-accent)] mt-6 mb-4">$1</h3>')
            .replace(/\*\*([^*]+):\*\*/g, '<strong class="text-[var(--color-text-primary)]">$1:</strong>')
            .replace(/\* (.*?)$/gm, '<li class="text-[var(--color-text-primary)] mb-2">$1</li>')
            .replace(/(<li.*?>.*?<\/li>)+/gs, '<ul class="list-disc list-inside space-y-2 mb-4">$&</ul>')
        }}
      />
    </div>
  );
}