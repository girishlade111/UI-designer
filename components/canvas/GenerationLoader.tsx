"use client";

import { useEffect, useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export type GenerationLoaderProps = {
  isLoading: boolean;
  revealedScreenNames: string[];
  onCancel: () => void;
};

export function GenerationLoader({
  isLoading,
  revealedScreenNames,
  onCancel,
}: GenerationLoaderProps) {
  const [isSlow, setIsSlow] = useState(false);
  const [progressWidth, setProgressWidth] = useState("0%");

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      setIsSlow(false);
      // Trigger the progress bar animation shortly after mount
      setTimeout(() => setProgressWidth("90%"), 50);

      timeoutId = setTimeout(() => {
        setIsSlow(true);
      }, 20000); // 20 seconds
    } else {
      setProgressWidth("0%");
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(15,15,15,0.85)] backdrop-blur-sm">
      <div className="flex flex-col items-center max-w-md w-full p-8 text-center">
        <Sparkles className="w-12 h-12 text-[var(--accent)] animate-pulse mb-6" />
        
        <h2 className="text-2xl font-bold text-white mb-2">Generating your app flow…</h2>
        
        {!isSlow ? (
          <p className="text-sm text-[var(--text-muted)] mb-8">This takes 8–15 seconds</p>
        ) : (
          <div className="flex flex-col items-center gap-3 mb-8">
            <p className="text-sm text-yellow-500 font-medium">Taking longer than usual… ⏱ Try again if this doesn't complete.</p>
            <Button onClick={onCancel} variant="outline" size="sm" className="bg-transparent border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-primary)]">
              Cancel
            </Button>
          </div>
        )}

        <div className="w-full bg-[var(--surface)] rounded-lg p-6 flex flex-col items-start gap-3 border border-[var(--border)] text-left min-h-[160px]">
          {revealedScreenNames.map((name, idx) => (
            <div key={idx} className="flex items-center gap-2 text-white font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Check className="w-4 h-4 text-green-500" />
              <span>{name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-[var(--text-muted)] mt-1">
            <span className="w-4 h-4 flex items-center justify-center text-lg leading-none animate-pulse">_</span>
            <span className="animate-pulse">Thinking...</span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-[var(--surface)] rounded-full mt-8 overflow-hidden">
          <div 
            className="h-full bg-[var(--accent)] rounded-full transition-all ease-out"
            style={{ 
              width: progressWidth,
              transitionDuration: "12s" 
            }}
          />
        </div>
      </div>
    </div>
  );
}
