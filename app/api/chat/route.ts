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

    const model = openai(apiKey, {
      baseURL: "https://api.openai.com/v1",
    });

    const { text } = await generateText({
      model,
      messages,
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