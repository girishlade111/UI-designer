"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useAppStore } from "@/store/useAppStore";
import { Settings, Square, Play, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "@/components/ModelSelector";
import { parseCodeBlock } from "@/lib/parse-code-block";

const tools = {
  askClarificationQuestion: {
    description: "Use this if the user's prompt is too vague or lacks layout/color details.",
    parameters: {
      type: "object",
      properties: {
        question: { type: "string" },
      },
      required: ["question"],
    },
  },
};

export function ChatPanel() {
  const { selectedProviderId, selectedModelId, apiKeys, setIsSettingsOpen, currentGeneratedCode, setCurrentGeneratedCode, setIsGenerating } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const processedToolCalls = useRef<Set<string>>(new Set());

  const currentApiKey = selectedProviderId ? apiKeys[selectedProviderId] || "" : "";
  const isDisabled = !currentApiKey || !selectedProviderId || !selectedModelId;

  const { messages, input, handleInputChange, isLoading, addToolResult, append } = useChat({
    api: "/api/chat",
    body: { selectedProviderId, selectedModelId, apiKeys },
    headers: { "Content-Type": "application/json" },
    tools,
    enabled: !isDisabled,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setIsGenerating(isLoading);
  }, [isLoading, setIsGenerating]);

  // Auto-respond to clarification tool calls
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const toolInvocations = lastMessage.toolInvocations;
    if (!toolInvocations || toolInvocations.length === 0) return;

    toolInvocations.forEach((invocation) => {
      if (processedToolCalls.current.has(invocation.toolCallId)) return;
      processedToolCalls.current.add(invocation.toolCallId);

      if (invocation.toolName === "askClarificationQuestion") {
        const parsedArgs = typeof invocation.args === "string" ? JSON.parse(invocation.args) : invocation.args;
        addToolResult({
          toolCallId: invocation.toolCallId,
          result: { question: parsedArgs.question },
        });
      }
    });
  }, [messages, addToolResult]);

  // Parse code blocks from completed assistant messages
  useEffect(() => {
    if (isLoading) return;

    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;

    const text = typeof lastAssistant.content === "string" ? lastAssistant.content : "";
    const code = parseCodeBlock(text);
    if (code) {
      setCurrentGeneratedCode(code);
    }
  }, [messages, isLoading, setCurrentGeneratedCode]);

  const handleSubmitWithImage = async (imageDataUrl?: string) => {
    if (!input.trim() && !imageDataUrl) return;

    let userText = input.trim();

    if (currentGeneratedCode && !imageDataUrl) {
      userText = `[Current Code State:\n${currentGeneratedCode}]\n\nModify this code based on the user's request: ${userText}`;
    }

    const content: Array<{ type: string; text?: string; image?: string }> = [];

    if (imageDataUrl) {
      content.push({ type: "image", image: imageDataUrl });
    }
    if (userText) {
      content.push({ type: "text", text: userText });
    }

    await append({
      role: "user",
      content: content,
    });
  };

  const hasCode = currentGeneratedCode.length > 0;

  const inputChangeFn = handleInputChange ?? (() => {});
  const chatInput = input ?? "";

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
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role as "user" | "assistant"}
                content={msg.content}
                toolInvocations={msg.toolInvocations}
              />
            ))
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
          input={chatInput}
          onInputChange={inputChangeFn}
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
          <Square className="h-4 w-4 mr-2" />
          Stop
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={isDisabled || !hasCode}
        >
          <Play className="h-4 w-4 mr-2" />
          Run
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={!hasCode}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}