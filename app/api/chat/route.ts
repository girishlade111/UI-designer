import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, tool, convertToModelMessages } from "ai";
import { z } from "zod";
import { PROVIDERS } from "@/lib/models-registry";

export const dynamic = "force-dynamic";

const systemPrompt = `You are an expert UI developer. Generate modern, accessible React components using Tailwind CSS and shadcn/ui.

RULES:
- Always wrap your code output in a single \`\`\`tsx ... \`\`\` markdown block
- The code must be a single self-contained React component with a default export
- Use Tailwind CSS for all styling. Use shadcn/ui primitives when appropriate
- Make the component responsive and accessible
- Do NOT include installation instructions or explanations outside the code block
- If the user's request is too vague, use the askClarificationQuestion tool instead of guessing

When the user provides an image:
- Analyze the wireframe/mockup image carefully
- Ask clarifying questions if the layout or details are unclear
- Generate code based on what you see in the image

When the user's request is too vague or lacks details about layout, colors, or functionality:
- Use the askClarificationQuestion tool to ask a focused question`;

const chatTools = {
  askClarificationQuestion: tool({
    description: "Use this if the user's prompt is too vague or lacks layout/color details.",
    inputSchema: z.object({
      question: z.string().describe("The clarifying question to ask the user"),
    }),
  }),
  generateReactComponent: tool({
    description: "Use this when the requirements are clear to generate the final code.",
    inputSchema: z.object({
      code: z.string().describe("The complete React component code"),
    }),
  }),
};

const BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  groq: "https://api.groq.com/openai/v1",
  togetherai: "https://api.together.ai/v1",
  deepseek: "https://api.deepseek.com/v1",
  xai: "https://api.x.ai/v1",
  glm: "https://open.bigmodel.cn/api/paas/v4",
  minimax: "https://api.minimax.chat/v1",
  kimi: "https://api.moonshot.cn/v1",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, selectedProviderId, selectedModelId, apiKeys, currentGeneratedCode } = body;

    if (!selectedProviderId) {
      return new Response(JSON.stringify({ error: "No provider selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!selectedModelId) {
      return new Response(JSON.stringify({ error: "No model selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = apiKeys?.[selectedProviderId];
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `API key not found for provider: ${selectedProviderId}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const provider = PROVIDERS.find((p) => p.id === selectedProviderId);
    if (!provider) {
      return new Response(JSON.stringify({ error: "Invalid provider" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const modelRecord = provider.models.find((m) => m.id === selectedModelId);
    if (!modelRecord) {
      return new Response(JSON.stringify({ error: "Invalid model for this provider" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let model;
    if (selectedProviderId === "gemini") {
      const google = createGoogleGenerativeAI({ apiKey });
      model = google(selectedModelId);
    } else if (selectedProviderId === "anthropic") {
      const anthropic = createAnthropic({ apiKey });
      model = anthropic(selectedModelId);
    } else {
      const baseUrl = BASE_URLS[selectedProviderId] || provider.baseUrl;
      const openaiProvider = createOpenAI({ apiKey, baseURL: baseUrl });
      model = openaiProvider(selectedModelId);
    }

    const activeSystemPrompt = currentGeneratedCode
      ? `${systemPrompt}\n\nThe user currently has a generated component. Here is the current code:\n\n\`\`\`tsx\n${currentGeneratedCode}\`\`\`\n\nModify this code based on the user's request. Use the generateReactComponent tool to output the updated code.`
      : systemPrompt;

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model,
      system: activeSystemPrompt,
      messages: modelMessages,
      tools: chatTools,
      toolChoice: "auto",
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
