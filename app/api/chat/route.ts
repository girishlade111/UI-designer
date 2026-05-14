import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, apiKey } = body;

    if (!apiKey) {
      return Response.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const systemPrompt = {
      role: "system",
      content: `You are an expert UI developer. Generate modern, accessible React components using Tailwind CSS and shadcn/ui. Always wrap your code output in \`\`\`tsx ... \`\`\` markdown blocks. Respond with ONLY the code block, no additional text or explanations.`,
    };

    const messagesWithSystem = [systemPrompt, ...messages];

    const model = openai("gpt-4o", { apiKey });

    const { text } = await generateText({
      model,
      messages: messagesWithSystem,
    });

    return Response.json({ text });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}