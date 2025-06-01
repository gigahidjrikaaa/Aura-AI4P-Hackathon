'use client';

import { IEntry } from '@/types/entry';

interface CorrelationMatrixProps {
  entries: IEntry[];
}

export default function CorrelationMatrix({ entries }: CorrelationMatrixProps) {
  const calculateCorrelations = () => {
    const factors = ['mood', 'energy'];
    const tags = [...new Set(entries.flatMap(e => e.tags))].slice(0, 5); // Top 5 tags
    
    const allFactors = [...factors, ...tags];
    const correlations: { [key: string]: { [key: string]: number } } = {};
    
    allFactors.forEach(factor1 => {
      correlations[factor1] = {};
      allFactors.forEach(factor2 => {
        if (factor1 === factor2) {
          correlations[factor1][factor2] = 1;
        } else {
          correlations[factor1][factor2] = calculateCorrelation(factor1, factor2);
        }
      });
    });
    
    return { correlations, factors: allFactors };
  };

  const calculateCorrelation = (factor1: string, factor2: string): number => {
    const values1 = entries.map(e => getFactorValue(e, factor1));
    const values2 = entries.map(e => getFactorValue(e, factor2));
    
    // Pearson correlation calculation
    const n = values1.length;
    const sum1 = values1.reduce((a, b) => a + b, 0);
    const sum2 = values2.reduce((a, b) => a + b, 0);
    const sum1Sq = values1.reduce((sum, val) => sum + val * val, 0);
    const sum2Sq = values2.reduce((sum, val) => sum + val * val, 0);
    const sum12 = values1.reduce((sum, val, i) => sum + val * values2[i], 0);
    
    const numerator = n * sum12 - sum1 * sum2;
    const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const getFactorValue = (entry: IEntry, factor: string): number => {
    if (factor === 'mood') return entry.mood;
    if (factor === 'energy') return entry.energy;
    return entry.tags.includes(factor) ? 1 : 0; // Binary for tags
  };

  const getCorrelationColor = (value: number) => {
    const abs = Math.abs(value);
    if (abs > 0.7) return 'bg-[var(--color-success)]';
    if (abs > 0.4) return 'bg-[var(--color-warning)]';
    if (abs > 0.2) return 'bg-[var(--color-accent)]';
    return 'bg-[var(--color-surface)]';
  };

  const { correlations, factors } = calculateCorrelations();

  return (
    <div className="glass p-6 rounded-xl glow-soft">
      <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 flex items-center">
        <span className="mr-2">🔬</span>
        Correlation Matrix
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-2"></th>
              {factors.map(factor => (
                <th key={factor} className="p-2 text-[var(--color-text-secondary)] font-medium transform -rotate-45 origin-bottom-left">
                  {factor}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {factors.map(factor1 => (
              <tr key={factor1}>
                <td className="p-2 text-[var(--color-text-secondary)] font-medium">{factor1}</td>
                {factors.map(factor2 => {
                  const correlation = correlations[factor1][factor2];
                  return (
                    <td key={factor2} className="p-1">
                      <div 
                        className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${getCorrelationColor(correlation)}`}
                        title={`${factor1} vs ${factor2}: ${correlation.toFixed(2)}`}
                      >
                        {correlation.toFixed(1)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-[var(--color-text-secondary)]">
        <p><strong>Reading:</strong> Values closer to ±1 indicate stronger correlations. Hover for details.</p>
      </div>
    </div>
  );
}