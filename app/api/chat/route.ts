import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const dynamic = "force-dynamic";

const systemPrompt = `You are an expert UI developer. Your goal is to create modern, accessible React components using Tailwind CSS and shadcn/ui.

When the user provides an image:
- Analyze the wireframe/mockup image carefully
- Ask clarifying questions if the layout or details are unclear
- Generate code based on what you see in the image

When the user's request is clear and complete:
- Use the generateReactComponent tool to output the code

When the user's request is too vague or lacks details about:
- Layout structure
- Color scheme or styling preferences
- Component functionality
- Specific elements or sections
- Use the askClarificationQuestion tool to ask clarifying questions

Always ask clarifying questions if the requirements are unclear. Only generate code when you have enough information.`;

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
  generateReactComponent: {
    description: "Use this when the requirements are clear to generate the final code.",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The complete React component code with Tailwind CSS",
        },
      },
      required: ["code"],
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

    const transformedMessages = messages.map((msg: { role: string; content: string | Array<{ type: string; text?: string; image?: string }> }) => ({
      ...msg,
      content: transformMessageContent(msg.content),
    }));

    const model = openai("gpt-4o", { apiKey });

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