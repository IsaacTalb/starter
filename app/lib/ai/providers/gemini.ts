export type ProviderChatParams = {
  apiKey: string;
  model: string;
  prompt: string;
};

export async function geminiChat({ apiKey, model, prompt }: ProviderChatParams): Promise<string> {
  const safeModel = encodeURIComponent(model);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 700 },
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${txt.slice(0, 220)}`);
  }

  const data = await res.json();
  return String(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
}
