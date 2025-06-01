import { IEntry } from '@/types/entry';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AnalysisResponse {
  analysis: string;
  analysis_type?: 'trauma_informed' | 'standard' | string; // Added analysis_type
  entries_analyzed: number;
}

export async function analyzePatterns(entries: IEntry[]): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze-patterns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ entries }),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  return response.json();
}