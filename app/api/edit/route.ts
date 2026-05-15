import { NextResponse } from 'next/server';
import { EditRequest } from '@/types/project';

const EDIT_SYSTEM_PROMPT = `You are a UI/UX code editor. The user has an HTML screen and wants to make a specific change.
Rules:

Apply ONLY the change the user requested. Do not restructure or redesign the screen.
Preserve all existing content, layout, and styles that were not mentioned in the instruction.
If the instruction changes a color, update that color everywhere it appears.
If the instruction adds an element, insert it in the most logical position.
Return ONLY the complete updated HTML. No explanation, no preamble, no markdown.`;

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n');
    if (firstNewline !== -1) {
      cleaned = cleaned.substring(firstNewline + 1);
    }
    // Remove "html" language identifier if present on the same line
    if (cleaned.startsWith('html\n')) {
      cleaned = cleaned.substring(5);
    }
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3).trim();
  }
  return cleaned;
}

async function callNvidiaNimEdit(currentHtml: string, instruction: string): Promise<string> {
  const baseUrl = process.env.NVIDIA_NIM_BASE_URL;
  const apiKey = process.env.NVIDIA_NIM_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('NVIDIA NIM configuration is missing');
  }

  const userPrompt = `Current HTML:\n${currentHtml}\nEdit instruction: ${instruction}`;

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
          { role: 'system', content: EDIT_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
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

async function callCloudflareAiEdit(currentHtml: string, instruction: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_AI_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error('Cloudflare AI configuration is missing');
  }

  const userPrompt = `Current HTML:\n${currentHtml}\nEdit instruction: ${instruction}`;

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
          { role: 'system', content: EDIT_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
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

export async function POST(req: Request) {
  let currentHtmlFallback = '';
  
  try {
    const body = await req.json() as EditRequest;
    const { currentHtml, instruction } = body;

    if (!currentHtml || !instruction) {
      return NextResponse.json(
        { error: "currentHtml and instruction are required." },
        { status: 400 }
      );
    }
    
    currentHtmlFallback = currentHtml;

    let rawResponse = '';
    
    try {
      try {
        rawResponse = await callNvidiaNimEdit(currentHtml, instruction);
      } catch (nvidiaError) {
        console.error("NVIDIA NIM edit failed, falling back to Cloudflare", nvidiaError);
        try {
          rawResponse = await callCloudflareAiEdit(currentHtml, instruction);
        } catch (cloudflareError) {
          console.error("Cloudflare edit fallback failed", cloudflareError);
          throw new Error("AI_UNAVAILABLE");
        }
      }

      const cleanedHtml = stripMarkdownFences(rawResponse);
      const lowerCleaned = cleanedHtml.toLowerCase();
      
      const hasHtmlTags = lowerCleaned.includes('<html') && lowerCleaned.includes('</html>');
      const isLongEnough = cleanedHtml.length > 200;

      if (!hasHtmlTags || !isLongEnough) {
        return NextResponse.json(
          { 
            updatedHtml: currentHtml, 
            error: "Edit could not be applied. Try rephrasing — e.g., 'Change the top bar background to dark blue' instead of 'make it dark'." 
          },
          { status: 200 } // Requirement: return original html with error flag but successful request overall
        );
      }

      return NextResponse.json({ updatedHtml: cleanedHtml }, { status: 200 });

    } catch (aiError) {
       if (aiError instanceof Error && aiError.message === "AI_UNAVAILABLE") {
         return NextResponse.json(
           { updatedHtml: currentHtml, error: "AI service temporarily unavailable." },
           { status: 503 }
         );
       }
       throw aiError; // Handled by outer catch
    }

  } catch (error) {
    console.error("Unhandled error in /api/edit:", error);
    return NextResponse.json(
      { updatedHtml: currentHtmlFallback, error: "Edit failed due to an unexpected error." },
      { status: 500 }
    );
  }
}
