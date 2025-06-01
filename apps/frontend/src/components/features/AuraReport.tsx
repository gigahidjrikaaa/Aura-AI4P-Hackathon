'use client';

import { AnalysisResponse } from '@/services/api';

interface AuraReportProps {
  analysis: AnalysisResponse;
}

export default function AuraReport({ analysis }: AuraReportProps) {
  const processMarkdown = (text: string) => {
    return text
      .replace(/### (.*?)$/gm, '<h3 class="text-xl font-semibold text-[var(--color-accent)] mt-8 mb-4 flex items-center"><span class="mr-3">🔮</span>$1</h3>')
      .replace(/\*\*([^*]+):\*\*/g, '<strong class="text-[var(--color-accent-soft)]">$1:</strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--color-text-primary)]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-[var(--color-accent-soft)]">$1</em>')
      .replace(/\* (.*?)$/gm, '<li class="text-[var(--color-text-primary)] mb-3 flex items-start"><span class="text-[var(--color-accent)] mr-2 mt-1">→</span><span>$1</span></li>')
      .replace(/(<li[\s\S]*?>[\s\S]*?<\/li>)+/g, '<ul class="space-y-2 mb-6 ml-4">$&</ul>')
      .replace(/^(?!<[hl]|<ul)(.+)$/gm, '<p class="text-[var(--color-text-primary)] leading-relaxed mb-4">$1</p>');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-4 rounded-full bg-[var(--color-accent)] bg-opacity-20 glow-soft mr-4">
            <span className="text-3xl">🌌</span>
          </div>
          <div>
            <h2 className="text-3xl font-light text-[var(--color-accent)] mb-1">
              Your Aura Revealed
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              Insights from {analysis.entries_analyzed} entries
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-[var(--color-text-secondary)]">
            Analysis completed
          </div>
          <div className="text-xs text-[var(--color-accent)]">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="glass p-6 rounded-xl glow-soft">
        <div 
          className="prose prose-invert max-w-none space-y-4"
          dangerouslySetInnerHTML={{ 
            __html: processMarkdown(analysis.analysis)
          }}
        />
      </div>

      <div className="mt-8 p-6 bg-[var(--color-accent)] bg-opacity-5 rounded-xl border border-[var(--color-accent)] border-opacity-20">
        <div className="flex items-center text-white mb-3">
          <span className="text-xl mr-2">💫</span>
          <span className="font-medium">Remember</span>
        </div>
        <p className="text-white text-sm leading-relaxed">
          These insights are based on your personal patterns. Use them as a compass for self-discovery, 
          not absolute truth. Your emotional journey is uniquely yours, and every day brings new possibilities.
        </p>
      </div>
    </div>
  );
}