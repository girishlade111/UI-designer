import { LayoutType } from '@/types/project';
import { getSystemPrompt } from '@/lib/ai/prompts';

export async function callCloudflareAi(prompt: string, layoutType: LayoutType, extraInstruction?: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_AI_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error('Cloudflare AI configuration is missing');
  }

  const systemPrompt = getSystemPrompt(layoutType, extraInstruction);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-4-scout-17b-16e-instruct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
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
      throw new Error(`Cloudflare AI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.result.response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
