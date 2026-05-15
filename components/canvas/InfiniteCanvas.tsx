"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Screen, LayoutType } from "@/types/project";
import { ScreenFrame } from "./ScreenFrame";
import { Minus, Plus } from "lucide-react";

export type InfiniteCanvasProps = {
  screens: Screen[];
  layoutType: LayoutType;
  selectedScreenId: string | null;
  isPrototypeMode: boolean;
  onSelectScreen: (screenId: string | null) => void;
  onEditClick: () => void;
  onRegenerate: (screenId: string) => void;
  loadingScreenId: string | null;
};

export function InfiniteCanvas({
  screens,
  layoutType,
  selectedScreenId,
  isPrototypeMode,
  onSelectScreen,
  onEditClick,
  onRegenerate,
  loadingScreenId,
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1.0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const screenWidth = layoutType === "mobile" ? 390 : 1280;
  const screenHeight = layoutType === "mobile" ? 844 : 800;
  const gap = 80;

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  const fitToView = useCallback(() => {
    if (!containerRef.current || screens.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const totalWidth = screens.length * screenWidth + Math.max(0, screens.length - 1) * gap;
    
    // Fit with 60px padding on each side (120px total)
    let newZoom = (rect.width - 120) / totalWidth; 
    newZoom = Math.min(Math.max(newZoom, 0.2), 1.0);
    
    triggerAnimation();
    setZoom(newZoom);
    setOffset({
      x: (rect.width - totalWidth * newZoom) / 2,
      y: (rect.height - screenHeight * newZoom) / 2,
    });
  }, [screens.length, screenWidth, screenHeight, gap, triggerAnimation]);

  // Center screens on initial load
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (screens.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      fitToView();
    }
  }, [screens.length, fitToView]);

  // Keyboard shortcut F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        fitToView();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fitToView]);

  // Non-passive wheel event for zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const zoomDelta = e.deltaY * 0.001;
      let newZoom = Math.min(Math.max(zoom - zoomDelta, 0.2), 2.0);

      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setZoom((prevZoom) => {
        const scaleRatio = newZoom / prevZoom;
        setOffset((prev) => ({
          x: cursorX - (cursorX - prev.x) * scaleRatio,
          y: cursorY - (cursorY - prev.y) * scaleRatio,
        }));
        return newZoom;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".screen-frame-wrapper")) return;
    
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setHasMoved(true);
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (hasMoved) return; // Was a drag, not a click
    if ((e.target as HTMLElement).closest(".screen-frame-wrapper")) return;

    onSelectScreen(null);

    // If currently zoomed > 1.5, reset zoom to fit view
    if (zoom > 1.5) {
      fitToView();
    }
  };

  const handleScreenClick = (screenId: string, index: number) => {
    onSelectScreen(screenId);
    if (zoom < 0.8 && containerRef.current) {
      const newZoom = 1.0;
      const screenCenterX = index * (screenWidth + gap) + screenWidth / 2;
      const screenCenterY = screenHeight / 2;

      const rect = containerRef.current.getBoundingClientRect();
      triggerAnimation();
      setZoom(newZoom);
      setOffset({
        x: rect.width / 2 - screenCenterX * newZoom,
        y: rect.height / 2 - screenCenterY * newZoom,
      });
    }
  };

  const handleZoomIn = () => {
    triggerAnimation();
    setZoom((z) => {
      const newZoom = Math.min(z + 0.1, 2.0);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cursorX = rect.width / 2;
        const cursorY = rect.height / 2;
        const scaleRatio = newZoom / z;
        setOffset((prev) => ({
          x: cursorX - (cursorX - prev.x) * scaleRatio,
          y: cursorY - (cursorY - prev.y) * scaleRatio,
        }));
      }
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    triggerAnimation();
    setZoom((z) => {
      const newZoom = Math.max(z - 0.1, 0.2);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cursorX = rect.width / 2;
        const cursorY = rect.height / 2;
        const scaleRatio = newZoom / z;
        setOffset((prev) => ({
          x: cursorX - (cursorX - prev.x) * scaleRatio,
          y: cursorY - (cursorY - prev.y) * scaleRatio,
        }));
      }
      return newZoom;
    });
  };

  // Touch logic
  const touchState = useRef({
    initialDistance: 0,
    initialZoom: 1,
    initialOffset: { x: 0, y: 0 },
    initialCenter: { x: 0, y: 0 },
    isPinching: false,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".screen-frame-wrapper") && e.touches.length === 1) return;

    if (e.touches.length === 1) {
      setIsDragging(true);
      setHasMoved(false);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    } else if (e.touches.length === 2 && containerRef.current) {
      setIsDragging(false);
      touchState.current.isPinching = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchState.current.initialDistance = Math.hypot(dx, dy);
      touchState.current.initialZoom = zoom;

      const rect = containerRef.current.getBoundingClientRect();
      touchState.current.initialCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
      };
      touchState.current.initialOffset = offset;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setHasMoved(true);
      setOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchState.current.isPinching) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const scaleDelta = distance / touchState.current.initialDistance;

      let newZoom = touchState.current.initialZoom * scaleDelta;
      newZoom = Math.min(Math.max(newZoom, 0.2), 2.0);

      const scaleRatio = newZoom / touchState.current.initialZoom;
      setZoom(newZoom);
      setOffset({
        x: touchState.current.initialCenter.x - (touchState.current.initialCenter.x - touchState.current.initialOffset.x) * scaleRatio,
        y: touchState.current.initialCenter.y - (touchState.current.initialCenter.y - touchState.current.initialOffset.y) * scaleRatio,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchState.current.isPinching = false;
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full absolute overflow-hidden touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        top: 0,
        left: 0,
        backgroundColor: "var(--background)",
        backgroundImage: "radial-gradient(circle, #2A2A2A 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleBackgroundClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className={`absolute top-0 left-0 origin-top-left ${isAnimating ? "transition-transform duration-300 ease-out" : ""}`}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        {screens.map((screen, index) => (
          <div
            key={screen.id}
            className="absolute top-0 screen-frame-wrapper"
            style={{ left: `${index * (screenWidth + gap)}px` }}
            onClick={() => handleScreenClick(screen.id, index)}
          >
            <ScreenFrame
              screen={screen}
              layoutType={layoutType}
              isSelected={selectedScreenId === screen.id}
              isZoomed={zoom >= 0.8}
              isLoading={loadingScreenId === screen.id}
              scale={zoom}
              onSelect={() => {}} // Handled by wrapper
              onEditClick={onEditClick}
              onRegenerate={onRegenerate}
            />
          </div>
        ))}
      </div>

      {/* Zoom Indicator */}
      {screens.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3 py-1.5 shadow-lg">
          <button 
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-[var(--background)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium w-12 text-center text-[var(--text-primary)]">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-[var(--background)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
