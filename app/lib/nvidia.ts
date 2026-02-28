import {
  deleteProviderApiKey,
  getInsights as getInsightsUnified,
  getProviderApiKey,
  setProviderApiKey,
} from './ai';

export type InsightsResult = {
  summary?: string;
  roadmap?: [string, string][];
  table?: Record<string, unknown>[];
  error?: string;
};

export async function setApiKey(key: string) {
  return setProviderApiKey('nvidia', key);
}

export async function getApiKey(): Promise<string | null> {
  return getProviderApiKey('nvidia');
}

export async function deleteApiKey() {
  return deleteProviderApiKey('nvidia');
}

export async function getInsights(text: string, apiKey?: string): Promise<InsightsResult> {
  const result = await getInsightsUnified({ text, provider: 'nvidia', apiKey });
  return {
    summary: result.summary,
    error: result.error,
  };
}
