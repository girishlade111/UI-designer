"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { tool, DefaultChatTransport } from "ai";
import { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useAppStore } from "@/store/useAppStore";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "@/components/ModelSelector";
import { parseCodeBlock } from "@/lib/parse-code-block";

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

export function ChatPanel() {
  const { selectedProviderId, selectedModelId, apiKeys, setIsSettingsOpen, currentGeneratedCode, setCurrentGeneratedCode, setIsGenerating } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const processedToolCalls = useRef<Set<string>>(new Set());
  const [input, setInput] = useState("");

  const currentApiKey = selectedProviderId ? apiKeys[selectedProviderId] || "" : "";
  const isDisabled = !currentApiKey || !selectedProviderId || !selectedModelId;

  const { messages, sendMessage, status, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: { "Content-Type": "application/json" },
      body: { selectedProviderId, selectedModelId, apiKeys, currentGeneratedCode },
    }),
    tools: chatTools,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setIsGenerating(isLoading);
  }, [isLoading, setIsGenerating]);

  // Process tool calls from message parts
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const toolParts = lastMessage.parts.filter(
      (p) => p.type.startsWith("tool-")
    ) as Array<{ type: string; toolCallId: string; toolName: string; input?: Record<string, unknown>; state?: string; output?: unknown }>;

    if (toolParts.length === 0) return;

    toolParts.forEach((part) => {
      if (processedToolCalls.current.has(part.toolCallId)) return;
      if (part.state !== "input-available") return;
      processedToolCalls.current.add(part.toolCallId);

      const toolName = part.type.replace("tool-", "");
      const args = part.input ?? {};

      if (toolName === "askClarificationQuestion") {
        addToolResult({
          tool: "askClarificationQuestion",
          toolCallId: part.toolCallId,
          output: { question: (args as { question?: string }).question ?? "" },
        });
      } else if (toolName === "generateReactComponent") {
        setCurrentGeneratedCode((args as { code?: string }).code ?? "");
        addToolResult({
          tool: "generateReactComponent",
          toolCallId: part.toolCallId,
          output: { success: true },
        });
      }
    });
  }, [messages, addToolResult, setCurrentGeneratedCode]);

  // Parse code blocks from completed assistant messages
  useEffect(() => {
    if (isLoading) return;

    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;

    const textParts = lastAssistant.parts.filter((p) => p.type === "text") as Array<{ type: string; text: string }>;
    const text = textParts.map((p) => p.text).join("");
    const code = parseCodeBlock(text);
    if (code) {
      setCurrentGeneratedCode(code);
    }
  }, [messages, isLoading, setCurrentGeneratedCode]);

  const handleSubmitWithImage = async (imageDataUrl?: string) => {
    if (!input.trim() && !imageDataUrl) return;

    const userText = input.trim();
    setInput("");

    await sendMessage({
      role: "user",
      parts: [
        ...(imageDataUrl
          ? [{ type: "file" as const, mediaType: "image/png", url: imageDataUrl }]
          : []),
        ...(userText
          ? [{ type: "text" as const, text: userText }]
          : []),
      ],
    });
  };

  const hasCode = currentGeneratedCode.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Chat & Controls</h2>
        </div>
        <ModelSelector />
      </div>

      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">
                {!selectedProviderId
                  ? "Select a provider and model above to start"
                  : !currentApiKey
                    ? "Enter your API key above to start"
                    : "Describe what you want to build, or upload a wireframe image"}
              </p>
              {!isDisabled && (
                <p className="text-xs text-muted-foreground">
                  Try: &ldquo;Create a login form from this wireframe&rdquo;
                </p>
              )}
            </div>
          ) : (
            messages.map((msg) => {
              const textParts = msg.parts.filter((p) => p.type === "text") as Array<{ type: string; text: string }>;
              const fileParts = msg.parts.filter((p) => p.type === "file") as Array<{ type: string; url: string }>;
              const toolParts = msg.parts.filter((p) => p.type.startsWith("tool-")) as Array<{
                type: string;
                toolCallId: string;
                toolName: string;
                input?: Record<string, unknown>;
                state?: string;
                output?: unknown;
              }>;

              const content = [
                ...fileParts.map((p) => ({ type: "image" as const, image: p.url })),
                ...textParts.map((p) => ({ type: "text" as const, text: p.text })),
              ];

              const toolInvocations = toolParts.map((p) => ({
                toolCallId: p.toolCallId,
                toolName: p.type.replace("tool-", ""),
                args: p.input ?? {},
                result: p.output,
              }));

              return (
                <ChatMessage
                  key={msg.id}
                  role={msg.role as "user" | "assistant"}
                  content={content}
                  toolInvocations={toolInvocations.length > 0 ? toolInvocations : undefined}
                />
              );
            })
          )}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-2xl px-4 py-2.5 text-sm bg-muted/70 text-foreground rounded-bl-md">
                Processing...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <ChatInput
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          onSubmit={handleSubmitWithImage}
          disabled={isDisabled}
          isLoading={isLoading}
        />
      </div>

      <div className="p-4 border-t border-border flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={isDisabled}
        >
          Stop
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={isDisabled || !hasCode}
        >
          Run
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={!hasCode}
        >
          Export
        </Button>
      </div>
    </div>
  );
}
