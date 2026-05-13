"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useAppStore } from "@/store/useAppStore";
import { Settings, Square, Play, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatPanel() {
  const { apiKey, chatHistory, addChatMessage, setIsSettingsOpen, currentGeneratedCode, setCurrentGeneratedCode } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDisabled = !apiKey;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = (message: string) => {
    addChatMessage({ role: "user", content: message });
    addChatMessage({ role: "assistant", content: "Generating UI..." });
  };

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
          {chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">
                {isDisabled
                  ? "Add your API key in Settings to start"
                  : "Describe what you want to build, and I'll help you create it"}
              </p>
              {!isDisabled && (
                <p className="text-xs text-muted-foreground">
                  Try: "Create a login form with email and password fields"
                </p>
              )}
            </div>
          ) : (
            chatHistory.map((msg) => (
              <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <ChatInput onSend={handleSend} disabled={isDisabled} />
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