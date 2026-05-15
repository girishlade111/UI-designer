import { createOpenAI } from "@ai-sdk/openai";
import { createGoogle } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
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

const tools = {
  askClarificationQuestion: {
    description: "Use this if the user's prompt is too vague or lacks layout/color details.",
    parameters: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The clarifying question to ask the user",
        },
      },
      required: ["question"],
    },
  },
};

function transformMessageContent(content: string | Array<{ type: string; text?: string; image?: string }>) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    
    content.forEach((part) => {
      if (part.type === "text" && part.text) {
        parts.push({ type: "text", text: part.text });
      } else if (part.type === "image" && part.image) {
        parts.push({ type: "image_url", image_url: { url: part.image } });
      }
    });
    
    return parts;
  }
  
  return content;
}

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, selectedProviderId, selectedModelId, apiKeys } = body;

    if (!selectedProviderId) {
      return Response.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    if (!selectedModelId) {
      return Response.json(
        { error: "Model is required" },
        { status: 400 }
      );
    }

    const provider = PROVIDERS.find((p) => p.id === selectedProviderId);
    if (!provider) {
      return Response.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    const apiKey = apiKeys?.[selectedProviderId];
    if (!apiKey) {
      return Response.json(
        { error: `API key is required for ${provider.name}` },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const transformedMessages = messages.map((msg: { role: string; content: string | Array<{ type: string; text?: string; image?: string }> }) => ({
      ...msg,
      content: transformMessageContent(msg.content),
    }));

    let model;

    if (selectedProviderId === "gemini") {
      model = createGoogle({
        apiKey,
      })(selectedModelId);
    } else if (selectedProviderId === "anthropic") {
      const anthropicKey = apiKey.startsWith("sk-ant-") ? apiKey : `Bearer ${apiKey}`;
      model = createAnthropic({
        apiKey: anthropicKey,
      })(selectedModelId);
    } else {
      const baseURL = BASE_URLS[selectedProviderId];
      if (!baseURL) {
        return Response.json(
          { error: `Unsupported provider: ${selectedProviderId}` },
          { status: 400 }
        );
      }

      const openai = createOpenAI({
        baseURL,
        apiKey,
      });
      model = openai(selectedModelId);
    }

    const result = streamText({
      model,
      messages: transformedMessages,
      system: systemPrompt,
      tools,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}