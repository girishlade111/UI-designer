"use client";

import { useRef, useCallback, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Send, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";


interface ChatInputProps {
  input: string;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (imageDataUrl?: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({ input, onInputChange, onSubmit, disabled, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e);
    adjustHeight();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(imagePreview ?? undefined);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleSend = () => {
    onSubmit(imagePreview ?? undefined);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setImagePreview(null);
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="Attached wireframe"
            className="max-h-24 rounded-lg border border-border"
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="relative flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Add API key in Settings to start" : "Describe your UI or attach a wireframe..."}
            disabled={disabled}
            className="min-h-[44px] max-h-[200px] resize-none pr-12 py-3"
            rows={1}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 bottom-1 h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={disabled || (!(input ?? "").trim() && !imagePreview) || isLoading}
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
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}