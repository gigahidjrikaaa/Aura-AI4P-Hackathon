'use client';

import { IEntry } from '@/types/entry';

interface PatternConfidenceScoringProps {
  entries: IEntry[];
}

interface ConfidenceScore {
  pattern: string;
  confidence: number;
  dataPoints: number;
  reliability: 'excellent' | 'good' | 'moderate' | 'poor';
  description: string;
  factors: string[];
  timeframe: string;
}

export default function PatternConfidenceScoring({ entries }: PatternConfidenceScoringProps) {
  const calculateConfidenceScores = (): ConfidenceScore[] => {
    const scores: ConfidenceScore[] = [];

    // 1. Mood-Energy Correlation Confidence
    const moodEnergyConfidence = calculateMoodEnergyConfidence();
    if (moodEnergyConfidence.confidence > 0.3) {
      scores.push(moodEnergyConfidence);
    }

    // 2. Weekly Pattern Confidence
    const weeklyPatternConfidence = calculateWeeklyPatternConfidence();
    if (weeklyPatternConfidence.confidence > 0.2) {
      scores.push(weeklyPatternConfidence);
    }

    // 3. Tag Impact Confidence
    const tagConfidenceScores = calculateTagImpactConfidence();
    scores.push(...tagConfidenceScores);

    // 4. Trend Confidence
    const trendConfidence = calculateTrendConfidence();
    if (trendConfidence.confidence > 0.25) {
      scores.push(trendConfidence);
    }

    // 5. Volatility Pattern Confidence
    const volatilityConfidence = calculateVolatilityConfidence();
    if (volatilityConfidence.confidence > 0.3) {
      scores.push(volatilityConfidence);
    }

    return scores.sort((a, b) => b.confidence - a.confidence).slice(0, 6);
  };

  const calculateMoodEnergyConfidence = (): ConfidenceScore => {
    const correlationData = entries.map(e => ({ mood: e.mood, energy: e.energy }));
    const correlation = calculateCorrelation(
      correlationData.map(d => d.mood),
      correlationData.map(d => d.energy)
    );
    
    const dataPoints = entries.length;
    const timeSpan = Math.ceil((new Date(entries[0].date).getTime() - new Date(entries[entries.length - 1].date).getTime()) / (1000 * 60 * 60 * 24));
    
    // Confidence based on correlation strength, data points, and time span
    let confidence = Math.abs(correlation);
    confidence *= Math.min(dataPoints / 14, 1); // Boost confidence with more data
    confidence *= Math.min(timeSpan / 21, 1); // Boost confidence with longer timespan
    
    return {
      pattern: 'Mood-Energy Synchronization',
      confidence: Math.min(confidence, 0.95),
      dataPoints,
      reliability: getReliabilityLevel(confidence),
      description: `Your mood and energy levels show ${Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak'} correlation (r=${correlation.toFixed(2)})`,
      factors: [
        `${dataPoints} data points`,
        `${timeSpan} day timespan`,
        `Correlation strength: ${Math.abs(correlation).toFixed(2)}`
      ],
      timeframe: `${timeSpan} days`
    };
  };

  const calculateWeeklyPatternConfidence = (): ConfidenceScore => {
    const dayAverages = Array(7).fill(0).map((_, day) => {
      const dayEntries = entries.filter(e => new Date(e.date).getDay() === day);
      return dayEntries.length > 0 
        ? dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length
        : 0;
    });

    const variance = calculateVariance(dayAverages.filter(avg => avg > 0));
    const coverage = dayAverages.filter(avg => avg > 0).length / 7;
    const weeksOfData = Math.floor(entries.length / 7);
    
    let confidence = variance > 1.5 ? 0.8 : variance > 1 ? 0.6 : 0.3;
    confidence *= coverage; // Reduce confidence if we don't have all days
    confidence *= Math.min(weeksOfData / 3, 1); // Need at least 3 weeks for good confidence
    
    const maxDay = dayAverages.indexOf(Math.max(...dayAverages));
    const minDay = dayAverages.indexOf(Math.min(...dayAverages.filter(avg => avg > 0)));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      pattern: 'Weekly Rhythm Pattern',
      confidence: Math.min(confidence, 0.9),
      dataPoints: entries.length,
      reliability: getReliabilityLevel(confidence),
      description: `Your mood peaks on ${dayNames[maxDay]} and dips on ${dayNames[minDay]} with ${(variance).toFixed(1)} variance`,
      factors: [
        `${Math.round(coverage * 100)}% day coverage`,
        `${weeksOfData} weeks of data`,
        `Mood variance: ${variance.toFixed(2)}`
      ],
      timeframe: `${weeksOfData} weeks`
    };
  };

  const calculateTagImpactConfidence = (): ConfidenceScore[] => {
    const tagImpacts: { [tag: string]: { values: number[], avgImpact: number, count: number } } = {};
    const overallAvg = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;

    entries.forEach(entry => {
      const moodDiff = entry.mood - overallAvg;
      entry.tags.forEach(tag => {
        if (!tagImpacts[tag]) tagImpacts[tag] = { values: [], avgImpact: 0, count: 0 };
        tagImpacts[tag].values.push(moodDiff);
        tagImpacts[tag].count += 1;
      });
    });

    return Object.entries(tagImpacts)
      .filter(([, data]) => data.count >= 3) // Need at least 3 occurrences
      .map(([tag, data]) => {
        const avgImpact = data.values.reduce((sum, val) => sum + val, 0) / data.values.length;
        const consistency = 1 - (calculateStandardDeviation(data.values) / Math.abs(avgImpact + 0.1));
        
        let confidence = Math.min(data.count / 10, 1) * 0.7; // More occurrences = higher confidence
        confidence += Math.abs(avgImpact) / 5 * 0.2; // Stronger impact = higher confidence
        confidence += Math.max(0, consistency) * 0.1; // Consistency bonus
        
        return {
          pattern: `"${tag}" Impact Pattern`,
          confidence: Math.min(confidence, 0.85),
          dataPoints: data.count,
          reliability: getReliabilityLevel(confidence),
          description: `"${tag}" ${avgImpact > 0 ? 'boosts' : 'lowers'} mood by ${Math.abs(avgImpact).toFixed(1)} points on average`,
          factors: [
            `${data.count} occurrences`,
            `Impact: ${avgImpact > 0 ? '+' : ''}${avgImpact.toFixed(2)}`,
            `Consistency: ${Math.max(0, consistency).toFixed(2)}`
          ],
          timeframe: `${data.count} instances`
        };
      })
      .filter(score => score.confidence > 0.25)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  };

  const calculateTrendConfidence = (): ConfidenceScore => {
    if (entries.length < 7) return { pattern: '', confidence: 0, dataPoints: 0, reliability: 'poor', description: '', factors: [], timeframe: '' };

    const recentEntries = entries.slice(0, 7);
    const olderEntries = entries.slice(-7);
    
    const recentAvg = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, e) => sum + e.mood, 0) / olderEntries.length;
    const trendStrength = Math.abs(recentAvg - olderAvg);
    
    const timeSpan = Math.ceil((new Date(entries[0].date).getTime() - new Date(entries[entries.length - 1].date).getTime()) / (1000 * 60 * 60 * 24));
    
    let confidence = trendStrength / 5; // Stronger trends = higher confidence
    confidence *= Math.min(entries.length / 14, 1); // More data = higher confidence
    confidence *= Math.min(timeSpan / 21, 1); // Longer timespan = higher confidence
    
    return {
      pattern: 'Mood Trend Direction',
      confidence: Math.min(confidence, 0.8),
      dataPoints: entries.length,
      reliability: getReliabilityLevel(confidence),
      description: `${recentAvg > olderAvg ? 'Improving' : 'Declining'} trend with ${trendStrength.toFixed(1)} point ${recentAvg > olderAvg ? 'increase' : 'decrease'}`,
      factors: [
        `${entries.length} data points`,
        `${timeSpan} day span`,
        `Trend strength: ${trendStrength.toFixed(2)}`
      ],
      timeframe: `${timeSpan} days`
    };
  };

  const calculateVolatilityConfidence = (): ConfidenceScore => {
    const moodChanges = [];
    for (let i = 1; i < entries.length; i++) {
      moodChanges.push(Math.abs(entries[i-1].mood - entries[i].mood));
    }
    
    const avgVolatility = moodChanges.reduce((sum, change) => sum + change, 0) / moodChanges.length;
    const volatilityStd = calculateStandardDeviation(moodChanges);
    
    let confidence = Math.min(entries.length / 14, 1) * 0.8;
    confidence += (avgVolatility > 2 ? 0.2 : 0); // Bonus for high volatility
    
    return {
      pattern: 'Emotional Volatility Pattern',
      confidence: Math.min(confidence, 0.75),
      dataPoints: moodChanges.length,
      reliability: getReliabilityLevel(confidence),
      description: `${avgVolatility > 2 ? 'High' : avgVolatility > 1 ? 'Moderate' : 'Low'} emotional volatility (${avgVolatility.toFixed(1)} avg daily change)`,
      factors: [
        `${moodChanges.length} day-to-day changes`,
        `Average volatility: ${avgVolatility.toFixed(2)}`,
        `Standard deviation: ${volatilityStd.toFixed(2)}`
      ],
      timeframe: `${moodChanges.length} transitions`
    };
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const calculateVariance = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  };

  const calculateStandardDeviation = (values: number[]): number => {
    return Math.sqrt(calculateVariance(values));
  };

  const getReliabilityLevel = (confidence: number): 'excellent' | 'good' | 'moderate' | 'poor' => {
    if (confidence >= 0.8) return 'excellent';
    if (confidence >= 0.6) return 'good';
    if (confidence >= 0.4) return 'moderate';
    return 'poor';
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'excellent': return 'text-[var(--color-success)]';
      case 'good': return 'text-[var(--color-success)]';
      case 'moderate': return 'text-[var(--color-warning)]';
      case 'poor': return 'text-[var(--color-error)]';
      default: return 'text-[var(--color-text-secondary)]';
    }
  };

  const getReliabilityIcon = (reliability: string) => {
    switch (reliability) {
      case 'excellent': return '🎯';
      case 'good': return '✅';
      case 'moderate': return '⚠️';
      case 'poor': return '❓';
      default: return '📊';
    }
  };

  const confidenceScores = calculateConfidenceScores();

  if (confidenceScores.length === 0) {
    return (
      <div className="glass p-6 rounded-xl glow-soft">
        <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Pattern Confidence Analysis
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Need more data to calculate reliable confidence scores. Continue tracking for better insights!
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl glow-soft">
      <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
        <span className="mr-2">🎯</span>
        Pattern Confidence Analysis
      </h3>
      
      <p className="text-sm text-[var(--color-text-primary)] mb-6">
        Statistical confidence levels for detected patterns. Higher confidence indicates more reliable insights.
      </p>

      <div className="space-y-4">
        {confidenceScores.map((score, index) => (
          <div key={index} className="border border-[var(--color-accent)] border-opacity-20 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getReliabilityIcon(score.reliability)}</span>
                <h4 className="font-medium text-[var(--color-text-primary)]">{score.pattern}</h4>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--color-text-primary)]">
                  {Math.round(score.confidence * 100)}%
                </div>
                <div className={`text-xs font-medium capitalize ${getReliabilityColor(score.reliability)}`}>
                  {score.reliability}
                </div>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="w-full bg-[var(--color-surface)] rounded-full h-3 mb-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  score.reliability === 'excellent' || score.reliability === 'good' 
                    ? 'bg-gradient-to-r from-[var(--color-success)] to-[var(--color-accent)]'
                    : score.reliability === 'moderate'
                    ? 'bg-gradient-to-r from-[var(--color-warning)] to-[var(--color-accent)]'
                    : 'bg-gradient-to-r from-[var(--color-error)] to-[var(--color-warning)]'
                }`}
                style={{ width: `${Math.round(score.confidence * 100)}%` }}
              ></div>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
              {score.description}
            </p>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-medium text-[var(--color-text-primary)] mb-1">Contributing Factors:</div>
                <ul className="space-y-1 text-[var(--color-text-secondary)]">
                  {score.factors.map((factor, i) => (
                    <li key={i}>• {factor}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-[var(--color-text-primary)] mb-1">Analysis Span:</div>
                <div className="text-[var(--color-text-secondary)]">{score.timeframe}</div>
                <div className="font-medium text-[var(--color-text-primary)] mt-2 mb-1">Data Points:</div>
                <div className="text-[var(--color-text-secondary)]">{score.dataPoints} entries</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[var(--color-accent)] bg-opacity-5 rounded-lg border border-[var(--color-accent)] border-opacity-20">
        <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Understanding Confidence Levels:</h4>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-[var(--color-text-primary)]">
          <div>
            <div className="flex items-center mb-1">
              <span className="mr-2">🎯</span>
              <strong>Excellent (80%+):</strong> Very reliable pattern
            </div>
            <div className="flex items-center mb-1">
              <span className="mr-2">✅</span>
              <strong>Good (60-79%):</strong> Reliable with some uncertainty
            </div>
          </div>
          <div>
            <div className="flex items-center mb-1">
              <span className="mr-2">⚠️</span>
              <strong>Moderate (40-59%):</strong> Pattern exists but needs more data
            </div>
            <div className="flex items-center">
              <span className="mr-2">❓</span>
              <strong>Poor (&lt;40%):</strong> Weak or unreliable pattern
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}