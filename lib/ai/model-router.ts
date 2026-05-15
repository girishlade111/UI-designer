import { LayoutType } from '@/types/project';
import { callNvidiaNim } from '@/lib/ai/nvidia-nim';
import { callCloudflareAi } from '@/lib/ai/cloudflare-ai';

export async function routeGeneration(prompt: string, layoutType: LayoutType, extraInstruction?: string): Promise<string> {
  try {
    const result = await callNvidiaNim(prompt, layoutType, extraInstruction);
    return result;
  } catch (error) {
    console.error("NVIDIA NIM failed, falling back to Cloudflare", error);
    try {
      const fallbackResult = await callCloudflareAi(prompt, layoutType, extraInstruction);
      return fallbackResult;
    } catch (fallbackError) {
      console.error("Cloudflare fallback failed", fallbackError);
      throw new Error("AI_UNAVAILABLE");
    }
  }
}
