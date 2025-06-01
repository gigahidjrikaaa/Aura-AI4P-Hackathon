'use client';

import { IEntry } from '@/types/entry';

interface EmotionalForecastProps {
  entries: IEntry[];
}

interface ForecastDay {
  date: string;
  dayName: string;
  predictedMood: number;
  predictedEnergy: number;
  confidence: number;
  risks: string[];
  opportunities: string[];
  suggestions: string[];
}

interface PredictionResult {
  mood: number;
  energy: number;
  confidence: number;
}

export default function EmotionalForecast({ entries }: EmotionalForecastProps) {
  const generateForecast = (): ForecastDay[] => {
    if (entries.length < 7) return [];

    const forecast: ForecastDay[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      const dayOfWeek = forecastDate.getDay();
      const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Predict based on historical patterns
      const prediction = predictDayValues(dayOfWeek, entries, i);
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        dayName,
        predictedMood: prediction.mood,
        predictedEnergy: prediction.energy,
        confidence: prediction.confidence,
        risks: identifyRisks(prediction, entries),
        opportunities: identifyOpportunities(prediction, entries),
        suggestions: generateSuggestions(prediction, dayName)
      });
    }
    
    return forecast;
  };

  const predictDayValues = (dayOfWeek: number, entries: IEntry[], daysAhead: number) => {
    // Get historical data for this day of week
    const sameDayEntries = entries.filter(entry => 
      new Date(entry.date).getDay() === dayOfWeek
    );
    
    // Calculate trends
    const recentTrend = calculateRecentTrend(entries.slice(0, 5));
    const cyclicalPattern = calculateCyclicalPattern(entries, dayOfWeek);
    
    // Base prediction on historical average for this day
    const baseMood = sameDayEntries.length > 0 
      ? sameDayEntries.reduce((sum, e) => sum + e.mood, 0) / sameDayEntries.length
      : entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
    
    const baseEnergy = sameDayEntries.length > 0
      ? sameDayEntries.reduce((sum, e) => sum + e.energy, 0) / sameDayEntries.length
      : entries.reduce((sum, e) => sum + e.energy, 0) / entries.length;
    
    // Apply trend and cyclical adjustments
    const trendAdjustment = recentTrend * (daysAhead / 7);
    const cyclicalAdjustment = cyclicalPattern;
    
    const predictedMood = Math.max(1, Math.min(10, baseMood + trendAdjustment + cyclicalAdjustment));
    const predictedEnergy = Math.max(1, Math.min(10, baseEnergy + trendAdjustment + cyclicalAdjustment));
    
    const confidence = Math.min(0.9, sameDayEntries.length * 0.15 + 0.3);
    
    return {
      mood: Math.round(predictedMood * 10) / 10,
      energy: Math.round(predictedEnergy * 10) / 10,
      confidence: Math.round(confidence * 100)
    };
  };

  const calculateRecentTrend = (recentEntries: IEntry[]): number => {
    if (recentEntries.length < 3) return 0;
    
    const first = recentEntries[recentEntries.length - 1];
    const last = recentEntries[0];
    const daysDiff = Math.max(1, recentEntries.length - 1);
    
    return ((last.mood + last.energy) - (first.mood + first.energy)) / (2 * daysDiff);
  };

  const calculateCyclicalPattern = (entries: IEntry[], targetDayOfWeek: number): number => {
    if (entries.length < 7) return 0; // Need enough data for meaningful cyclical patterns

    const dayOfWeekValues: { sumMood: number, sumEnergy: number, count: number }[] = 
      Array(7).fill(null).map(() => ({ sumMood: 0, sumEnergy: 0, count: 0 }));
    
    let totalMoodSum = 0;
    let totalEnergySum = 0;

    entries.forEach(entry => {
      const day = new Date(entry.date).getDay();
      dayOfWeekValues[day].sumMood += entry.mood;
      dayOfWeekValues[day].sumEnergy += entry.energy;
      dayOfWeekValues[day].count++;
      totalMoodSum += entry.mood;
      totalEnergySum += entry.energy;
    });

    const overallAverageMood = totalMoodSum / entries.length;
    const overallAverageEnergy = totalEnergySum / entries.length;
    const overallAverageCombined = (overallAverageMood + overallAverageEnergy) / 2;

    const targetDayData = dayOfWeekValues[targetDayOfWeek];
    if (targetDayData.count === 0) return 0; // No data for this day of week, no cyclical adjustment

    const targetDayAverageMood = targetDayData.sumMood / targetDayData.count;
    const targetDayAverageEnergy = targetDayData.sumEnergy / targetDayData.count;
    const targetDayAverageCombined = (targetDayAverageMood + targetDayAverageEnergy) / 2;
    
    // Return the deviation from the overall average
    return targetDayAverageCombined - overallAverageCombined;
  };

  const identifyRisks = (prediction: PredictionResult, entries: IEntry[]): string[] => {
    const risks: string[] = [];
    
    if (prediction.mood < 5) {
      risks.push("Predicted low mood - vulnerability window.");
    }
    
    if (prediction.energy < 4) {
      risks.push("Low energy predicted - risk of burnout.");
    }
    
    const hasRecentStressfulTags = entries.slice(0, 14).some(e => // Check last 14 entries
      e.tags.some(tag => ['stress', 'deadline', 'conflict', 'overwhelm', 'poor-sleep'].includes(tag.toLowerCase()))
    );

    if (hasRecentStressfulTags && (prediction.mood < 6 || prediction.energy < 5)) {
        risks.push("Recent stressors may impact predicted state.");
    }
    
    return [...new Set(risks)].slice(0, 2); // Max 2 risks
  };

  const identifyOpportunities = (prediction: PredictionResult, entries: IEntry[]): string[] => {
    const opportunities: string[] = [];

    if (prediction.mood >= 7 || prediction.energy >= 7) {
        entries.slice(0, 14).forEach(entry => { // Check last 14 entries
          if (entry.mood >= 7 && entry.energy >= 7) {
            const entryDate = new Date(entry.date);
            opportunities.push(`Recall positive factors from ${entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`);
          }
          if (entry.tags.some(tag => ['productive', 'creative', 'flow', 'social', 'exercise', 'hobby'].includes(tag.toLowerCase()))) {
            const positiveTags = entry.tags.filter(tag => ['productive', 'creative', 'flow', 'social', 'exercise', 'hobby'].includes(tag.toLowerCase()));
            opportunities.push(`Tap into past ${positiveTags.join('/')} activities.`);
          }
        });
    }
    
    if (prediction.mood >= 7) {
      opportunities.push("High mood predicted - good for engaging tasks.");
    }
    
    if (prediction.energy >= 7) {
      opportunities.push("High energy window - ideal for physical activities.");
    }
    return [...new Set(opportunities)].slice(0, 2); // Max 2 opportunities
  };

  const generateSuggestions = (prediction: PredictionResult, dayName: string): string[] => {
    const suggestions: string[] = [];
    
    if (prediction.mood < 5) {
      suggestions.push("Schedule gentle self-care activities");
      suggestions.push("Avoid making important decisions");
    } else if (prediction.mood >= 7) {
      suggestions.push("Perfect day for tackling challenging projects");
      suggestions.push("Schedule important conversations or meetings");
    }
    
    if (prediction.energy < 4) {
      suggestions.push("Plan rest and recovery activities");
      suggestions.push("Avoid overscheduling");
    } else if (prediction.energy >= 7) {
      suggestions.push("Great day for exercise or physical activities");
      suggestions.push("Take on energy-demanding tasks");
    }
    
    // Day-specific suggestions
    if (dayName === 'Monday') {
      suggestions.push("Ease into the week with manageable goals");
    } else if (dayName === 'Friday') {
      suggestions.push("Wrap up loose ends and celebrate progress");
    }
    
    return suggestions;
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😄';
    if (mood >= 6) return '😊';
    if (mood >= 4) return '😐';
    return '😔';
  };

  const getEnergyEmoji = (energy: number) => {
    if (energy >= 8) return '🌟';
    if (energy >= 6) return '⚡';
    if (energy >= 4) return '🔋';
    return '🪫';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-[var(--color-success)]';
    if (confidence >= 50) return 'text-[var(--color-warning)]';
    return 'text-[var(--color-text-secondary)]';
  };

  const forecast = generateForecast();

  if (forecast.length === 0) {
    return (
      <div className="glass p-6 rounded-xl glow-soft mb-6">
        <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
          <span className="mr-2">🔮</span>
          Emotional Weather Forecast
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Need at least 7 entries to generate your emotional weather forecast. Keep tracking! 🌟
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl glow-soft mb-6">
      <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
        <span className="mr-2">🔮</span>
        7-Day Emotional Weather Forecast
      </h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forecast.map((day) => (
          <div key={day.date} className="border border-[var(--color-accent)] border-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-[var(--color-text-primary)]">{day.dayName}</h4>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {new Date(day.date).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-xs font-medium ${getConfidenceColor(day.confidence)}`}>
                {day.confidence}% confidence
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <div className="text-lg mb-1">{getMoodEmoji(day.predictedMood)}</div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  Mood: {day.predictedMood}/10
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg mb-1">{getEnergyEmoji(day.predictedEnergy)}</div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  Energy: {day.predictedEnergy}/10
                </div>
              </div>
            </div>
            
            {day.risks.length > 0 && (
              <div className="mb-2">
                <h5 className="text-xs font-medium text-[var(--color-error)] mb-1">⚠️ Risks:</h5>
                <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
                  {day.risks.map((risk, i) => (
                    <li key={i}>• {risk}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {day.opportunities.length > 0 && (
              <div className="mb-2">
                <h5 className="text-xs font-medium text-[var(--color-success)] mb-1">✨ Opportunities:</h5>
                <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
                  {day.opportunities.map((opp, i) => (
                    <li key={i}>• {opp}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {day.suggestions.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-[var(--color-accent)] mb-1">💡 Suggestions:</h5>
                <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
                  {day.suggestions.slice(0, 2).map((suggestion, i) => (
                    <li key={i}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}