"use client";

import { cn } from "@/lib/utils";
import { Bot, User, HelpCircle } from "lucide-react";

type ContentPart = { type: string; text?: string; image?: string };

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string | ContentPart[];
  timestamp?: number;
  toolInvocations?: ToolInvocation[];
  icon?: React.ReactNode;
}

export function ChatMessage({ role, content, toolInvocations, icon }: ChatMessageProps) {
  const isUser = role === "user";

  const isArrayContent = Array.isArray(content);
  const textContent = isArrayContent 
    ? content.filter((p) => p.type === "text").map((p) => p.text).join(" ")
    : content;
  const images = isArrayContent 
    ? content.filter((p) => p.type === "image").map((p) => p.image) 
    : [];

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {icon || (isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />)}
      </div>
      <div className="space-y-2">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="Uploaded wireframe"
            className="max-h-32 rounded-lg border border-border"
          />
        ))}
        {toolInvocations?.map((invocation) => {
          if (invocation.toolName === "askClarificationQuestion") {
            const question = (invocation.args as Record<string, unknown>)?.question as string;
            return (
              <div
                key={invocation.toolCallId}
                className="rounded-2xl px-4 py-3 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-center gap-2 mb-1 text-amber-600 dark:text-amber-400">
                  <HelpCircle className="h-4 w-4" />
                  <span className="font-medium text-xs">Clarification needed</span>
                </div>
                <p className="text-foreground">{question}</p>
              </div>
            );
          }
          return null;
        })}
        {textContent && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm",
              isUser
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted/70 text-foreground rounded-bl-md"
            )}
          >
            {textContent}
          </div>
        )}
      </div>
    </div>
  );
}