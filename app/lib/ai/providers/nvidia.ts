export type ProviderChatParams = {
  apiKey: string;
  model: string;
  prompt: string;
};

export async function nvidiaChat({ apiKey, model, prompt }: ProviderChatParams): Promise<string> {
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`NVIDIA API error (${res.status}): ${txt.slice(0, 220)}`);
  }

  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? '').trim();
}
