import { LayoutType } from '@/types/project';

export async function callNvidiaNim(prompt: string, layoutType: LayoutType, extraInstruction?: string): Promise<string> {
  const baseUrl = process.env.NVIDIA_NIM_BASE_URL;
  const apiKey = process.env.NVIDIA_NIM_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('NVIDIA NIM configuration is missing');
  }

  let systemPrompt = `You are a UI/UX designer AI. The user will describe an app.
You must identify the 4 to 6 most important screens in the primary user journey of that app.
Generate complete, visually consistent HTML for each screen.
Rules:

Layout width: ${layoutType === 'mobile' ? '390px' : '1280px'}
All screens must share: the same primary color, same font style (system fonts only), same navigation bar, same button border-radius and style
HTML must be self-contained: all CSS must be inline or in a <style> block within the same file
DO NOT use any JavaScript in the generated HTML (static screens only)
DO NOT use Lorem Ipsum — use realistic, context-appropriate dummy content
DO NOT include any external CDN links, fonts, or scripts
Screen content must look like a real, polished app — not a wireframe

Return ONLY a valid JSON object. No explanation. No markdown. No backticks. Pure JSON.
Format: { "ScreenName": "<html>...</html>", "ScreenName2": "<html>...</html>", ... }
Generate exactly 4 to 6 screens.`;

  if (extraInstruction) {
    systemPrompt += `\n\n${extraInstruction}`;
  }

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
