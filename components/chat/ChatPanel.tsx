"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useAppStore } from "@/store/useAppStore";
import { Settings, Square, Play, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatPanel() {
  const { apiKey, setIsSettingsOpen, currentGeneratedCode, setCurrentGeneratedCode } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDisabled = !apiKey;

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: { apiKey },
    headers: { "Content-Type": "application/json" },
    onFinish: (message) => {
      if (message.role === "assistant") {
        const codeMatch = message.content.match(/```tsx\s*([\s\S]*?)\s*```/);
        const code = codeMatch ? codeMatch[1].trim() : message.content.trim();
        if (code.length > 0 && (code.includes("export") || code.includes("function") || code.includes("return"))) {
          setCurrentGeneratedCode(code);
        }
      }
    },
    enabled: !!apiKey,
  });

  const submitFn = handleSubmit ?? (() => {});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const hasCode = currentGeneratedCode.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-sm">Chat & Controls</h2>
        {!apiKey && (
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Add API Key
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">
                {isDisabled
                  ? "Add your API key in Settings to start"
                  : "Describe what you want to build, and I'll help you create it"}
              </p>
              {!isDisabled && (
                <p className="text-xs text-muted-foreground">
                  Try: &ldquo;Create a login form with email and password fields&rdquo;
                </p>
              )}
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg.id} role={msg.role as "user" | "assistant"} content={msg.content} />
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
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
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