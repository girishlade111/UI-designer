"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Send, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({ onSend, disabled, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, onSend, disabled]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex items-end gap-2">
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Add API key in Settings to start" : "Describe your UI..."}
          disabled={disabled}
          className="min-h-[44px] max-h-[200px] resize-none pr-12 py-3"
          rows={1}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1 bottom-1 h-8 w-8 text-muted-foreground hover:text-foreground"
          disabled={disabled || !input.trim() || isLoading}
          onClick={handleSend}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="shrink-0 h-11 w-11"
        disabled={disabled}
      >
        <ImagePlus className="h-4 w-4" />
      </Button>
    </div>
  );
}