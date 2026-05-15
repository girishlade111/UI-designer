import { NextResponse } from 'next/server';
import { GenerateRequest } from '@/types/project';
import { callNvidiaNim } from '@/lib/ai/nvidia-nim';

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n');
    if (firstNewline !== -1) {
      cleaned = cleaned.substring(firstNewline + 1);
    }
    // Remove "json" language identifier if present on the same line
    if (cleaned.startsWith('json\n')) {
      cleaned = cleaned.substring(5);
    }
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3).trim();
  }
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as GenerateRequest;
    const { prompt, layoutType } = body;

    if (!prompt || prompt.length < 10) {
      return NextResponse.json(
        { error: "Prompt too short. Be more specific." },
        { status: 400 }
      );
    }

    let rawResponse = '';
    let parsedObject = null;

    try {
      rawResponse = await callNvidiaNim(prompt, layoutType);
      const cleaned = stripMarkdownFences(rawResponse);
      parsedObject = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Initial parse failed or API error, retrying...", rawResponse, parseError);
      
      const retryInstruction = "Your previous response was not valid JSON. Return ONLY raw JSON, no markdown, no explanation.";
      rawResponse = await callNvidiaNim(prompt, layoutType, retryInstruction);
      const cleaned = stripMarkdownFences(rawResponse);
      
      // If this throws, it will be caught by the outer catch block
      parsedObject = JSON.parse(cleaned);
    }

    return NextResponse.json({ screens: parsedObject }, { status: 200 });

  } catch (error) {
    console.error("Unhandled error in /api/generate:", error);
    return NextResponse.json(
      { error: "Generation failed. Try simplifying your description." },
      { status: 500 }
    );
  }
}
