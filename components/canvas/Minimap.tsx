"use client";

import { Screen, LayoutType } from "@/types/project";
import { useRef } from "react";

export type MinimapProps = {
  screens: Screen[];
  layoutType: LayoutType;
  canvasOffset: { x: number; y: number };
  canvasZoom: number;
  selectedScreenId: string | null;
  canvasSize: { width: number; height: number };
  onMinimapClick: (x: number, y: number) => void;
};

export function Minimap({
  screens,
  layoutType,
  canvasOffset,
  canvasZoom,
  selectedScreenId,
  canvasSize,
  onMinimapClick,
}: MinimapProps) {
  const minimapRef = useRef<HTMLDivElement>(null);

  if (screens.length === 0) {
    return null;
  }

  // Actual screen dimensions
  const screenWidth = layoutType === "mobile" ? 390 : 1280;
  const screenHeight = layoutType === "mobile" ? 844 : 800;
  const gap = 80;

  // Minimap representation dimensions
  const miniWidth = layoutType === "mobile" ? 12 : 24;
  const miniHeight = layoutType === "mobile" ? 22 : 16;
  
  // Scale mapping factors
  const scaleX = miniWidth / screenWidth;
  const scaleY = miniHeight / screenHeight;
  const miniGap = gap * scaleX;

  // Content total dimensions in minimap
  const minimapContentWidth = screens.length * miniWidth + Math.max(0, screens.length - 1) * miniGap;
  const minimapContentHeight = miniHeight;

  // Minimap container dimensions
  const containerWidth = 180;
  const containerHeight = 120;

  // Centering offsets to place content in the middle of the minimap container
  const contentOffsetX = (containerWidth - minimapContentWidth) / 2;
  const contentOffsetY = (containerHeight - minimapContentHeight) / 2;

  // Calculate viewport indicator
  // Viewport top-left in original content scale
  const viewportOrigX = -canvasOffset.x / canvasZoom;
  const viewportOrigY = -canvasOffset.y / canvasZoom;
  
  // Viewport dimensions in original content scale
  const viewportOrigW = canvasSize.width / canvasZoom;
  const viewportOrigH = canvasSize.height / canvasZoom;

  // Map to minimap coordinates
  const indicatorX = contentOffsetX + viewportOrigX * scaleX;
  const indicatorY = contentOffsetY + viewportOrigY * scaleY;
  const indicatorW = viewportOrigW * scaleX;
  const indicatorH = viewportOrigH * scaleY;

  const handleClick = (e: React.MouseEvent) => {
    if (!minimapRef.current) return;
    
    const rect = minimapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert minimap click coordinates back to original content coordinates
    const originalClickX = (clickX - contentOffsetX) / scaleX;
    const originalClickY = (clickY - contentOffsetY) / scaleY;

    onMinimapClick(originalClickX, originalClickY);
  };

  return (
    <div
      ref={minimapRef}
      className="absolute glass overflow-hidden shadow-lg cursor-pointer"
      style={{
        bottom: "60px",
        right: "16px",
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        borderRadius: "8px",
        zIndex: 50,
      }}
      onClick={handleClick}
    >
      <div className="absolute top-2 left-2 text-[10px] font-medium text-[var(--text-muted)] pointer-events-none select-none z-20">
        Map
      </div>

      {/* Screens */}
      {screens.map((screen, index) => {
        const x = contentOffsetX + index * (miniWidth + miniGap);
        const y = contentOffsetY;
        const isSelected = selectedScreenId === screen.id;

        return (
          <div
            key={screen.id}
            className={`absolute rounded-[2px] transition-colors ${
              isSelected ? "bg-[var(--accent)]" : "bg-gray-500/40"
            }`}
            style={{
              left: `${x}px`,
              top: `${y}px`,
              width: `${miniWidth}px`,
              height: `${miniHeight}px`,
            }}
          />
        );
      })}

      {/* Viewport Indicator */}
      <div
        className="absolute border border-white/50 bg-white/10 rounded-[2px] pointer-events-none"
        style={{
          left: `${indicatorX}px`,
          top: `${indicatorY}px`,
          width: `${indicatorW}px`,
          height: `${indicatorH}px`,
        }}
      />
    </div>
  );
}
