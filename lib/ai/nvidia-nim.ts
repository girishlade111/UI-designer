import { LayoutType } from '@/types/project';
import { getSystemPrompt } from '@/lib/ai/prompts';

export async function callNvidiaNim(prompt: string, layoutType: LayoutType, extraInstruction?: string): Promise<string> {
  const baseUrl = process.env.NVIDIA_NIM_BASE_URL;
  const apiKey = process.env.NVIDIA_NIM_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('NVIDIA NIM configuration is missing');
  }

  const systemPrompt = getSystemPrompt(layoutType, extraInstruction);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'nvidia/glm-4.7',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA NIM API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
