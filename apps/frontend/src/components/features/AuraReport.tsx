'use client';

import { AnalysisResponse } from '@/services/api';

interface AuraReportProps {
  analysis: AnalysisResponse;
}

export default function AuraReport({ analysis }: AuraReportProps) {
  const processMarkdown = (text: string) => {
    return text
      .replace(/### (.*?)$/gm, '<h3 class="text-xl font-semibold text-[var(--color-accent)] mt-8 mb-4 flex items-center"><span class="mr-3 text-2xl">🌟</span>$1</h3>')
      .replace(/\*\*([^*]+):\*\*/g, '<strong class="text-[var(--color-accent-soft)] text-sm">$1:</strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--color-text-primary)] font-medium">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-[var(--color-accent-soft)] italic">$1</em>')
      .replace(/\* (.*?)$/gm, '<li class="text-[var(--color-text-primary)] mb-3 flex items-start bg-[var(--color-surface)] bg-opacity-50 p-3 rounded-lg"><span class="text-[var(--color-accent)] mr-3 mt-1 text-lg">→</span><span class="flex-1">$1</span></li>')
      .replace(/(<li[\s\S]*?>[\s\S]*?<\/li>)+/g, '<ul class="space-y-3 mb-6">$&</ul>')
      .replace(/^(?!<[hl]|<ul)(.+)$/gm, '<p class="text-[var(--color-text-primary)] leading-relaxed mb-4 text-base">$1</p>');
  };

  const extractKeyInsights = (text: string) => {
    const insights = [];
    
    // Extract pattern strength mentions
    const strengthMatches = text.match(/(\d+)% (likelihood|confidence|correlation)/gi);
    if (strengthMatches) {
      insights.push({
        type: 'statistical',
        value: strengthMatches[0],
        icon: '📊'
      });
    }
    
    // Extract prediction mentions
    const predictionMatches = text.match(/(predict|forecast|expect)[^.]+/gi);
    if (predictionMatches) {
      insights.push({
        type: 'predictive',
        value: predictionMatches[0],
        icon: '🔮'
      });
    }
    
    // Extract healing recommendations
    const healingMatches = text.match(/(recommend|suggest|consider)[^.]+/gi);
    if (healingMatches) {
      insights.push({
        type: 'actionable',
        value: healingMatches[0],
        icon: '💡'
      });
    }
    
    return insights.slice(0, 3);
  };

  const keyInsights = extractKeyInsights(analysis.analysis);

  return (
    <div>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-4 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-soft)] bg-opacity-20 glow-cosmic mr-4">
            <span className="text-3xl">🌌</span>
          </div>
          <div>
            <h2 className="text-3xl font-light cosmic-text mb-1">
              Your Aura Revealed
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              Deep insights from {analysis.entries_analyzed} emotional data points
            </p>
            <p className="text-xs text-[var(--color-accent)] mt-1">
              Trauma-informed analysis • Generated {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-[var(--color-text-secondary)]">
            Analysis Type
          </div>
          <div className="text-xs text-[var(--color-accent)] font-medium">
            {analysis.analysis_type === 'trauma_informed' ? '🧘 Trauma-Informed' : '📊 Standard'}
          </div>
        </div>
      </div>

      {/* Key Insights Cards */}
      {keyInsights.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {keyInsights.map((insight, index) => (
            <div key={index} className="glass p-4 rounded-xl border border-[var(--color-accent)] border-opacity-20">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">{insight.icon}</span>
                <span className="text-xs text-[var(--color-accent)] uppercase tracking-wide font-medium">
                  {insight.type}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                {insight.value.length > 80 ? insight.value.substring(0, 80) + '...' : insight.value}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {/* Main Analysis Content */}
      <div className="glass p-8 rounded-xl glow-soft mb-8">
        <div 
          className="prose prose-invert max-w-none space-y-6 text-base leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: processMarkdown(analysis.analysis)
          }}
        />
      </div>

      {/* Interactive Elements */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Confidence Meter */}
        <div className="glass p-6 rounded-xl">
          <h4 className="text-[var(--color-accent)] font-medium mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            Analysis Confidence
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Pattern Recognition</span>
              <span className="text-[var(--color-success)]">
                {analysis.entries_analyzed >= 10 ? 'High' : analysis.entries_analyzed >= 5 ? 'Medium' : 'Building'}
              </span>
            </div>
            <div className="w-full bg-[var(--color-surface)] rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-success)]"
                style={{ width: `${Math.min(analysis.entries_analyzed * 10, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              More data points increase analysis accuracy. Current: {analysis.entries_analyzed} entries.
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="glass p-6 rounded-xl">
          <h4 className="text-[var(--color-accent)] font-medium mb-3 flex items-center">
            <span className="mr-2">🚀</span>
            Recommended Next Steps
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="text-[var(--color-success)] mr-2">✓</span>
              <span>Continue daily check-ins for deeper insights</span>
            </div>
            <div className="flex items-center">
              <span className="text-[var(--color-accent)] mr-2">→</span>
              <span>Implement suggested healing practices</span>
            </div>
            <div className="flex items-center">
              <span className="text-[var(--color-accent)] mr-2">→</span>
              <span>Review patterns weekly for adjustments</span>
            </div>
            {analysis.entries_analyzed < 14 && (
              <div className="flex items-center">
                <span className="text-[var(--color-warning)] mr-2">⏳</span>
                <span>Track for 2+ weeks for seasonal patterns</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wisdom Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-soft)] bg-opacity-5 rounded-xl border border-[var(--color-accent)] border-opacity-20">
        <div className="flex items-center text-[var(--color-accent)] mb-3">
          <span className="text-xl mr-2">🌟</span>
          <span className="font-medium">Remember Your Journey</span>
        </div>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
          These insights are a compass for your healing journey, not absolute truth. Your emotional patterns are uniquely yours, 
          shaped by your experiences and resilience. Trust your inner wisdom, and use these insights to cultivate greater 
          self-compassion and inner peace. Every day brings new possibilities for growth and healing.
        </p>
        <div className="mt-4 flex items-center text-xs text-[var(--color-accent)]">
          <span className="mr-2">💝</span>
          <span>Generated with trauma-informed care and compassion</span>
        </div>
      </div>
    </div>
  );
}