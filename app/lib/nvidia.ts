// Minimal wrapper to call an NVIDIA-style insights endpoint.
// Uses secure storage (`expo-secure-store`) to retrieve the user's API key when one isn't passed in.
import * as SecureStore from 'expo-secure-store';

export type InsightsResult = {
  summary?: string;
  roadmap?: Array<[string, string]>;
  table?: Array<Record<string, any>>;
  error?: string;
};

const STORAGE_KEY = 'NVIDIA_API_KEY';

export async function setApiKey(key: string) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, key, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
    return true;
  } catch (e) {
    return false;
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    const v = await SecureStore.getItemAsync(STORAGE_KEY);
    return v;
  } catch (e) {
    return null;
  }
}

export async function deleteApiKey() {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

export async function getInsights(text: string, apiKey?: string, endpoint?: string): Promise<InsightsResult> {
  let key = apiKey;
  if (!key) {
    key = await getApiKey() ?? undefined;
  }

  if (!key) {
    // Local fallback: simple summary + sample roadmap
    return {
      summary: text.slice(0, 300),
      roadmap: [
        ['Research', 'Clarify requirements and audience'],
        ['Prototype', 'Make a quick mock or proof-of-concept'],
        ['Validate', 'Test with users and refine'],
      ],
    };
  }

  try {
    // Use NVIDIA Integrate REST API for chat completions. This avoids Node-only SDKs.
    // See: https://developer.nvidia.com/docs/integrate
    const url = endpoint ?? 'https://integrate.api.nvidia.com/v1/chat/completions';

    const payload = {
      model: 'mistralai/mixtral-8x22b-instruct-v0.1',
      messages: [{ role: 'user', content: text }],
      temperature: 0.5,
      max_tokens: 512,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      return { error: `API error: ${txt}` };
    }

    const data = await res.json();

    // Try to extract a reasonable summary from the model response.
    const reply = Array.isArray(data?.choices) ? data.choices.map((c: any) => c.message?.content || c.text || '').join('') : '';

    return {
      summary: reply || (data?.result ?? ''),
    } as InsightsResult;
  } catch (e: any) {
    return { error: String(e?.message ?? e) };
  }
}
