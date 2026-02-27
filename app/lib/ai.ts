import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { geminiChat } from './ai/providers/gemini';
import { nvidiaChat } from './ai/providers/nvidia';
import { openAIChat } from './ai/providers/openai';

export type AIProvider = 'nvidia' | 'openai' | 'gemini';

export type AISettings = {
  provider: AIProvider;
  model: string;
};

export type InsightsResult = {
  summary?: string;
  error?: string;
};

const SETTINGS_KEY = 'ideahub_ai_settings_v1';
const KEY_PREFIX = 'IDEAHUB_API_KEY_';

export const defaultModels: Record<AIProvider, string> = {
  nvidia: 'meta/llama-3.1-70b-instruct',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash',
};

const providerLabels: Record<AIProvider, string> = {
  nvidia: 'NVIDIA',
  openai: 'OpenAI',
  gemini: 'Gemini',
};

export function getProviderLabel(provider: AIProvider) {
  return providerLabels[provider];
}

export function getDefaultModel(provider: AIProvider) {
  return defaultModels[provider];
}

export async function getAISettings(): Promise<AISettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return { provider: 'nvidia', model: defaultModels.nvidia };
    }
    const parsed = JSON.parse(raw) as Partial<AISettings>;
    const provider = isProvider(parsed.provider) ? parsed.provider : 'nvidia';
    const model = typeof parsed.model === 'string' && parsed.model.trim() ? parsed.model : defaultModels[provider];
    return { provider, model };
  } catch {
    return { provider: 'nvidia', model: defaultModels.nvidia };
  }
}

export async function setAISettings(next: Partial<AISettings>) {
  const current = await getAISettings();
  const provider = isProvider(next.provider) ? next.provider : current.provider;
  const model = typeof next.model === 'string' && next.model.trim() ? next.model.trim() : current.model;
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ provider, model }));
  return { provider, model };
}

function apiKeyStorageKey(provider: AIProvider) {
  return `${KEY_PREFIX}${provider.toUpperCase()}`;
}

export async function getProviderApiKey(provider: AIProvider): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(apiKeyStorageKey(provider));
  } catch {
    return null;
  }
}

export async function setProviderApiKey(provider: AIProvider, key: string) {
  try {
    await SecureStore.setItemAsync(apiKeyStorageKey(provider), key.trim(), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteProviderApiKey(provider: AIProvider) {
  try {
    await SecureStore.deleteItemAsync(apiKeyStorageKey(provider));
    return true;
  } catch {
    return false;
  }
}

export async function testConnection(input?: Partial<AISettings> & { apiKey?: string }): Promise<InsightsResult> {
  return getInsights({
    text: 'Reply with exactly: connection-ok',
    provider: input?.provider,
    model: input?.model,
    apiKey: input?.apiKey,
  });
}

export async function getInsights(params: {
  text: string;
  provider?: AIProvider;
  model?: string;
  apiKey?: string;
}): Promise<InsightsResult> {
  const settings = await getAISettings();
  const provider = params.provider ?? settings.provider;
  const model = params.model?.trim() || settings.model || defaultModels[provider];
  const key = params.apiKey ?? (await getProviderApiKey(provider)) ?? undefined;

  if (!params.text.trim()) {
    return { error: 'Cannot generate AI output from empty text.' };
  }

  if (!key) {
    return {
      summary: params.text.slice(0, 320),
      error: `${getProviderLabel(provider)} API key is missing. Showing local fallback summary.`,
    };
  }

  try {
    let summary = '';
    const prompt = params.text.trim();

    if (provider === 'nvidia') {
      summary = await nvidiaChat({ apiKey: key, model, prompt });
    } else if (provider === 'openai') {
      summary = await openAIChat({ apiKey: key, model, prompt });
    } else {
      summary = await geminiChat({ apiKey: key, model, prompt });
    }

    if (!summary) {
      return { error: `${getProviderLabel(provider)} returned an empty response.` };
    }

    return { summary };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}

function isProvider(value: unknown): value is AIProvider {
  return value === 'nvidia' || value === 'openai' || value === 'gemini';
}
