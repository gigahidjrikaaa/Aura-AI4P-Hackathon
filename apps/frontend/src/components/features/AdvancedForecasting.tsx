'use client';

import { IEntry } from '@/types/entry';

interface AdvancedForecastingProps {
  entries: IEntry[];
}

interface ForecastModel {
  name: string;
  type: 'linear' | 'seasonal' | 'exponential' | 'pattern-based';
  accuracy: number;
  description: string;
  predictions: DayPrediction[];
  confidence: number;
  factors: string[];
}

interface DayPrediction {
  date: string;
  dayName: string;
  mood: number;
  energy: number;
  confidence: number;
  reasoning: string;
  risks: string[];
  opportunities: string[];
}

export default function AdvancedForecasting({ entries }: AdvancedForecastingProps) {
  const generateAdvancedForecasts = (): ForecastModel[] => {
    const models: ForecastModel[] = [];

    // 1. Linear Trend Model
    const linearModel = generateLinearTrendModel();
    if (linearModel.accuracy > 0.3) models.push(linearModel);

    // 2. Seasonal Pattern Model
    const seasonalModel = generateSeasonalPatternModel();
    if (seasonalModel.accuracy > 0.4) models.push(seasonalModel);

    // 3. Tag Impact Model
    const tagModel = generateTagImpactModel();
    if (tagModel.accuracy > 0.35) models.push(tagModel);

    // 4. Volatility-Adjusted Model
    const volatilityModel = generateVolatilityAdjustedModel();
    if (volatilityModel.accuracy > 0.4) models.push(volatilityModel);

    return models.sort((a, b) => b.accuracy - a.accuracy);
  };

  const generateLinearTrendModel = (): ForecastModel => {
    const predictions: DayPrediction[] = [];
    
    // Calculate linear trend using least squares
    const xValues = entries.map((_, i) => i);
    const yValuesMood = entries.map(e => e.mood).reverse(); // Reverse to get chronological order
    const yValuesEnergy = entries.map(e => e.energy).reverse();
    
    const moodTrend = calculateLinearRegression(xValues, yValuesMood);
    const energyTrend = calculateLinearRegression(xValues, yValuesEnergy);
    
    // Generate 14-day forecast
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      const x = entries.length + i;
      const predictedMood = Math.max(1, Math.min(10, moodTrend.slope * x + moodTrend.intercept));
      const predictedEnergy = Math.max(1, Math.min(10, energyTrend.slope * x + energyTrend.intercept));
      
      // Confidence decreases with time
      const confidence = Math.max(0.2, 0.8 - (i * 0.04));
      
      predictions.push({
        date: forecastDate.toISOString().split('T')[0],
        dayName: forecastDate.toLocaleDateString('en-US', { weekday: 'long' }),
        mood: Math.round(predictedMood * 10) / 10,
        energy: Math.round(predictedEnergy * 10) / 10,
        confidence: Math.round(confidence * 100),
        reasoning: `Linear trend: mood ${moodTrend.slope > 0 ? 'improving' : 'declining'} by ${Math.abs(moodTrend.slope).toFixed(2)}/day`,
        risks: predictedMood < 5 ? ['Predicted low mood period'] : [],
        opportunities: predictedMood > 7 ? ['High mood window - good for challenges'] : []
      });
    }

    // Calculate model accuracy based on R²
    const moodR2 = calculateRSquared(xValues, yValuesMood, moodTrend);
    const energyR2 = calculateRSquared(xValues, yValuesEnergy, energyTrend);
    const accuracy = (moodR2 + energyR2) / 2;

    return {
      name: 'Linear Trend Forecast',
      type: 'linear',
      accuracy: Math.max(0, accuracy),
      description: `Projects future mood and energy based on ${moodTrend.slope > 0 ? 'improving' : 'declining'} linear trends`,
      predictions,
      confidence: Math.round(accuracy * 100),
      factors: [
        `Mood trend: ${moodTrend.slope > 0 ? '+' : ''}${moodTrend.slope.toFixed(3)} per day`,
        `Energy trend: ${energyTrend.slope > 0 ? '+' : ''}${energyTrend.slope.toFixed(3)} per day`,
        `R² accuracy: ${(accuracy * 100).toFixed(1)}%`
      ]
    };
  };

  const generateSeasonalPatternModel = (): ForecastModel => {
    const predictions: DayPrediction[] = [];
    
    // Calculate day-of-week averages
    const dayAverages = Array(7).fill(0).map((_, day) => {
      const dayEntries = entries.filter(e => new Date(e.date).getDay() === day);
      return {
        mood: dayEntries.length > 0 ? dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length : 5,
        energy: dayEntries.length > 0 ? dayEntries.reduce((sum, e) => sum + e.energy, 0) / dayEntries.length : 5,
        count: dayEntries.length
      };
    });

    // Calculate weekly pattern strength
    const moodVariance = calculateVariance(dayAverages.map(d => d.mood));
    const energyVariance = calculateVariance(dayAverages.map(d => d.energy));
    const accuracy = Math.min(0.9, (moodVariance + energyVariance) / 8); // Normalize to 0-1

    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      const dayOfWeek = forecastDate.getDay();
      
      const dayData = dayAverages[dayOfWeek];
      const confidence = Math.min(0.9, dayData.count / 3 * 0.8); // Higher confidence with more historical data for that day
      
      predictions.push({
        date: forecastDate.toISOString().split('T')[0],
        dayName: forecastDate.toLocaleDateString('en-US', { weekday: 'long' }),
        mood: Math.round(dayData.mood * 10) / 10,
        energy: Math.round(dayData.energy * 10) / 10,
        confidence: Math.round(confidence * 100),
        reasoning: `Based on ${dayData.count} historical ${forecastDate.toLocaleDateString('en-US', { weekday: 'long' })} entries`,
        risks: dayData.mood < 5 ? [`${forecastDate.toLocaleDateString('en-US', { weekday: 'long' })}s tend to be challenging`] : [],
        opportunities: dayData.mood > 7 ? [`${forecastDate.toLocaleDateString('en-US', { weekday: 'long' })}s are typically positive`] : []
      });
    }

    return {
      name: 'Weekly Pattern Forecast',
      type: 'seasonal',
      accuracy,
      description: `Predicts based on your weekly emotional rhythms and day-of-week patterns`,
      predictions,
      confidence: Math.round(accuracy * 100),
      factors: [
        `Mood pattern variance: ${moodVariance.toFixed(2)}`,
        `Energy pattern variance: ${energyVariance.toFixed(2)}`,
        `Best day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayAverages.indexOf(dayAverages.reduce((max, day) => day.mood > max.mood ? day : max))]}`,
        `${Math.round(dayAverages.reduce((sum, day) => sum + day.count, 0) / 7)} avg entries per day type`
      ]
    };
  };

  const generateTagImpactModel = (): ForecastModel => {
    const predictions: DayPrediction[] = [];
    
    // Analyze tag impacts
    const tagImpacts = calculateTagImpacts();
    const recentTags = extractRecentTagPatterns();
    
    const today = new Date();
    const baselineMood = entries.slice(0, 7).reduce((sum, e) => sum + e.mood, 0) / Math.min(7, entries.length);
    const baselineEnergy = entries.slice(0, 7).reduce((sum, e) => sum + e.energy, 0) / Math.min(7, entries.length);

    for (let i = 1; i <= 14; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      // Predict based on likely tag recurrence
      const predictedTags = predictTagsForDay(forecastDate, recentTags);
      let moodAdjustment = 0;
      let energyAdjustment = 0;
      const reasoning: string[] = [];

      predictedTags.forEach(tag => {
        if (tagImpacts[tag]) {
          moodAdjustment += tagImpacts[tag].moodImpact;
          energyAdjustment += tagImpacts[tag].energyImpact;
          reasoning.push(`${tag}: ${tagImpacts[tag].moodImpact > 0 ? '+' : ''}${tagImpacts[tag].moodImpact.toFixed(1)} mood`);
        }
      });

      const predictedMood = Math.max(1, Math.min(10, baselineMood + moodAdjustment));
      const predictedEnergy = Math.max(1, Math.min(10, baselineEnergy + energyAdjustment));
      const confidence = Math.min(0.8, Object.keys(tagImpacts).length / 10 * 0.8);

      predictions.push({
        date: forecastDate.toISOString().split('T')[0],
        dayName: forecastDate.toLocaleDateString('en-US', { weekday: 'long' }),
        mood: Math.round(predictedMood * 10) / 10,
        energy: Math.round(predictedEnergy * 10) / 10,
        confidence: Math.round(confidence * 100),
        reasoning: reasoning.length > 0 ? reasoning.join(', ') : 'Baseline prediction',
        risks: predictedMood < 5 ? ['Tag patterns suggest challenging period'] : [],
        opportunities: predictedMood > 7 ? ['Positive tag patterns expected'] : []
      });
    }

    const accuracy = Math.min(0.8, Object.keys(tagImpacts).length / 15 * 0.8);

    return {
      name: 'Tag Impact Forecast',
      type: 'pattern-based',
      accuracy,
      description: `Forecasts based on your personal tag patterns and their emotional impacts`,
      predictions,
      confidence: Math.round(accuracy * 100),
      factors: [
        `${Object.keys(tagImpacts).length} significant tags analyzed`,
        `Top positive tag: ${Object.entries(tagImpacts).sort(([,a], [,b]) => b.moodImpact - a.moodImpact)[0]?.[0] || 'None'}`,
        `Top negative tag: ${Object.entries(tagImpacts).sort(([,a], [,b]) => a.moodImpact - b.moodImpact)[0]?.[0] || 'None'}`,
        `Pattern recognition confidence: ${Math.round(accuracy * 100)}%`
      ]
    };
  };

  const generateVolatilityAdjustedModel = (): ForecastModel => {
    const predictions: DayPrediction[] = [];
    
    // Calculate volatility metrics
    const moodChanges = [];
    for (let i = 1; i < entries.length; i++) {
      moodChanges.push(Math.abs(entries[i-1].mood - entries[i].mood));
    }
    
    const avgVolatility = moodChanges.reduce((sum, change) => sum + change, 0) / moodChanges.length;
    const volatilityStd = calculateStandardDeviation(moodChanges);
    
    const recentMood = entries.slice(0, 3).reduce((sum, e) => sum + e.mood, 0) / Math.min(3, entries.length);
    const recentEnergy = entries.slice(0, 3).reduce((sum, e) => sum + e.energy, 0) / Math.min(3, entries.length);

    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      // Apply volatility-based uncertainty
      const volatilityFactor = Math.min(1, avgVolatility / 3);
      const uncertainty = volatilityStd * volatilityFactor * (i / 14); // Uncertainty grows over time
      
      const predictedMood = Math.max(1, Math.min(10, recentMood + (Math.random() - 0.5) * uncertainty));
      const predictedEnergy = Math.max(1, Math.min(10, recentEnergy + (Math.random() - 0.5) * uncertainty));
      
      const confidence = Math.max(0.3, 0.8 - (volatilityFactor * 0.4) - (i * 0.02));

      predictions.push({
        date: forecastDate.toISOString().split('T')[0],
        dayName: forecastDate.toLocaleDateString('en-US', { weekday: 'long' }),
        mood: Math.round(predictedMood * 10) / 10,
        energy: Math.round(predictedEnergy * 10) / 10,
        confidence: Math.round(confidence * 100),
        reasoning: `Volatility-adjusted (±${uncertainty.toFixed(1)} variance expected)`,
        risks: avgVolatility > 2 ? ['High volatility period - expect fluctuations'] : [],
        opportunities: avgVolatility < 1 ? ['Stable period - good for planning'] : []
      });
    }

    const accuracy = Math.max(0.2, 0.7 - (avgVolatility / 5));

    return {
      name: 'Volatility-Adjusted Forecast',
      type: 'exponential',
      accuracy,
      description: `Accounts for your emotional volatility patterns and uncertainty ranges`,
      predictions,
      confidence: Math.round(accuracy * 100),
      factors: [
        `Average volatility: ${avgVolatility.toFixed(2)}`,
        `Volatility std dev: ${volatilityStd.toFixed(2)}`,
        `Recent mood baseline: ${recentMood.toFixed(1)}`,
        `Uncertainty factor: ${(avgVolatility / 3).toFixed(2)}`
      ]
    };
  };

  // Helper functions
  const calculateLinearRegression = (x: number[], y: number[]) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  const calculateRSquared = (x: number[], y: number[], regression: { slope: number, intercept: number }) => {
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => {
      const predicted = regression.slope * x[i] + regression.intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);

    return 1 - (ssResidual / ssTotal);
  };

  const calculateVariance = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  };

  const calculateStandardDeviation = (values: number[]): number => {
    return Math.sqrt(calculateVariance(values));
  };

  const calculateTagImpacts = () => {
    const tagImpacts: { [tag: string]: { moodImpact: number, energyImpact: number, count: number } } = {};
    const overallMoodAvg = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
    const overallEnergyAvg = entries.reduce((sum, e) => sum + e.energy, 0) / entries.length;

    entries.forEach(entry => {
      const moodDiff = entry.mood - overallMoodAvg;
      const energyDiff = entry.energy - overallEnergyAvg;
      
      entry.tags.forEach(tag => {
        if (!tagImpacts[tag]) tagImpacts[tag] = { moodImpact: 0, energyImpact: 0, count: 0 };
        tagImpacts[tag].moodImpact += moodDiff;
        tagImpacts[tag].energyImpact += energyDiff;
        tagImpacts[tag].count += 1;
      });
    });

    // Average the impacts
    Object.keys(tagImpacts).forEach(tag => {
      tagImpacts[tag].moodImpact /= tagImpacts[tag].count;
      tagImpacts[tag].energyImpact /= tagImpacts[tag].count;
    });

    return tagImpacts;
  };

  const extractRecentTagPatterns = () => {
    const recentEntries = entries.slice(0, 14);
    const tagFrequency: { [tag: string]: number } = {};
    
    recentEntries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    return tagFrequency;
  };

  const predictTagsForDay = (date: Date, recentTags: { [tag: string]: number }): string[] => {
    // Simple prediction: return tags with frequency > 2 in recent period
    return Object.entries(recentTags)
      .filter(([, freq]) => freq >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'linear': return '📈';
      case 'seasonal': return '🔄';
      case 'pattern-based': return '🏷️';
      case 'exponential': return '📊';
      default: return '🔮';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.7) return 'text-[var(--color-success)]';
    if (accuracy >= 0.5) return 'text-[var(--color-warning)]';
    return 'text-[var(--color-error)]';
  };

  const models = generateAdvancedForecasts();

  if (models.length === 0) {
    return (
      <div className="glass p-6 rounded-xl glow-soft">
        <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
          <span className="mr-2">🔮</span>
          Advanced Forecasting Models
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Need more data to generate reliable forecasting models. Continue tracking for sophisticated predictions!
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl glow-soft">
      <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
        <span className="mr-2">🔮</span>
        Advanced Forecasting Models
      </h3>
      
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        Multiple predictive models analyze your data using different mathematical approaches.
      </p>

      <div className="space-y-6">
        {models.map((model, index) => (
          <div key={index} className="border border-[var(--color-accent)] border-opacity-20 rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getModelTypeIcon(model.type)}</span>
                <div>
                  <h4 className="font-medium text-[var(--color-text-primary)]">{model.name}</h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">{model.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getAccuracyColor(model.accuracy)}`}>
                  {Math.round(model.accuracy * 100)}%
                </div>
                <div className="text-xs text-[var(--color-text-secondary)]">Accuracy</div>
              </div>
            </div>

            {/* Model Factors */}
            <div className="mb-4 p-3 bg-[var(--color-surface)] bg-opacity-50 rounded">
              <h5 className="text-xs font-medium text-[var(--color-text-primary)] mb-2">Model Factors:</h5>
              <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
                {model.factors.map((factor, i) => (
                  <div key={i}>• {factor}</div>
                ))}
              </div>
            </div>

            {/* Next 7 Days Preview */}
            <div>
              <h5 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Next 7 Days Forecast:</h5>
              <div className="grid grid-cols-7 gap-2 text-xs">
                {model.predictions.slice(0, 7).map((pred, i) => (
                  <div key={i} className="text-center p-2 bg-[var(--color-surface)] bg-opacity-30 rounded">
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {pred.dayName.slice(0, 3)}
                    </div>
                    <div className="text-[var(--color-accent)] font-mono">
                      {pred.mood.toFixed(1)}
                    </div>
                    <div className="text-[var(--color-text-secondary)] font-mono">
                      {pred.energy.toFixed(1)}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {pred.confidence}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notable Predictions */}
            <div className="mt-4">
              <h5 className="text-xs font-medium text-[var(--color-text-primary)] mb-2">Notable Predictions:</h5>
              <div className="space-y-1 text-xs">
                {model.predictions.slice(0, 3).map((pred, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <span className="text-[var(--color-text-secondary)]">
                      {pred.dayName}: {pred.reasoning}
                    </span>
                    <span className="text-[var(--color-accent)]">
                      {pred.confidence}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[var(--color-accent)] bg-opacity-5 rounded-lg border border-[var(--color-accent)] border-opacity-20">
        <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Understanding Forecast Models:</h4>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-[var(--color-text-secondary)]">
          <div>
            <div className="flex items-center mb-1">
              <span className="mr-2">📈</span>
              <strong>Linear:</strong> Trend-based projection
            </div>
            <div className="flex items-center mb-1">
              <span className="mr-2">🔄</span>
              <strong>Seasonal:</strong> Day-of-week patterns
            </div>
          </div>
          <div>
            <div className="flex items-center mb-1">
              <span className="mr-2">🏷️</span>
              <strong>Tag-based:</strong> Activity impact prediction
            </div>
            <div className="flex items-center">
              <span className="mr-2">📊</span>
              <strong>Volatility:</strong> Uncertainty-adjusted forecast
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mt-2 italic">
          Higher accuracy models are more reliable. Compare multiple models for best insights.
        </p>
      </div>
    </div>
  );
}