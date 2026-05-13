"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResizablePanelProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
}

export function ResizablePanel({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 30,
  minLeftWidth = 300,
  maxLeftWidth = 60,
}: ResizablePanelProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const container = document.getElementById("workspace-container");
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const minWidthPercent = (minLeftWidth / containerRect.width) * 100;
      const maxWidthPercent = maxLeftWidth;
      const clampedWidth = Math.min(Math.max(newWidth, minWidthPercent), maxWidthPercent);
      setLeftWidth(clampedWidth);
    },
    [isResizing, minLeftWidth, maxLeftWidth]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div
      id="workspace-container"
      className="flex flex-1 min-h-0 overflow-hidden"
    >
      <div
        className="shrink-0 overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPanel}
      </div>
      <div
        className={cn(
          "w-1 cursor-col-resize hover:bg-primary/20 transition-colors flex-shrink-0",
          isResizing && "bg-primary/50"
        )}
        onMouseDown={startResizing}
      />
      <div className="flex-1 min-w-0 overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
}