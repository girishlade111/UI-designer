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
  
  const [isMobileView, setIsMobileView] = useState(false);

  const screenWidth = layoutType === "mobile" ? 390 : 1280;
  const screenHeight = layoutType === "mobile" ? 844 : 800;
  const gap = 80;

  // Check mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Center screens on initial load
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (screens.length > 0 && !hasInitialized.current && containerRef.current && !isMobileView) {
      hasInitialized.current = true;
      const rect = containerRef.current.getBoundingClientRect();
      const totalWidth = screens.length * screenWidth + Math.max(0, screens.length - 1) * gap;
      setOffset({
        x: (rect.width - totalWidth * zoom) / 2,
        y: (rect.height - screenHeight * zoom) / 2,
      });
    }
  }, [screens.length, screenWidth, screenHeight, zoom, isMobileView]);

  // Non-passive wheel event for zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isMobileView) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      let newZoom = Math.min(Math.max(zoom + zoomDelta, 0.2), 2.0);

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
  }, [zoom, isMobileView]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobileView) return;
    if ((e.target as HTMLElement).closest(".screen-frame-wrapper")) return;
    
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobileView) return;
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
    if (isMobileView) return;
    if (hasMoved) return; // Was a drag, not a click
    if ((e.target as HTMLElement).closest(".screen-frame-wrapper")) return;

    onSelectScreen(null);

    // Zoom to fit
    if (containerRef.current && screens.length > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      const totalWidth = screens.length * screenWidth + Math.max(0, screens.length - 1) * gap;
      
      let newZoom = (rect.width - 100) / totalWidth; 
      newZoom = Math.min(Math.max(newZoom, 0.2), 1.0);
      
      setZoom(newZoom);
      setOffset({
        x: (rect.width - totalWidth * newZoom) / 2,
        y: (rect.height - screenHeight * newZoom) / 2,
      });
    }
  };

  const handleScreenClick = (screenId: string, index: number) => {
    onSelectScreen(screenId);
    if (!isMobileView && zoom < 0.8 && containerRef.current) {
      const newZoom = 1.0;
      const screenCenterX = index * (screenWidth + gap) + screenWidth / 2;
      const screenCenterY = screenHeight / 2;

      const rect = containerRef.current.getBoundingClientRect();
      setZoom(newZoom);
      setOffset({
        x: rect.width / 2 - screenCenterX * newZoom,
        y: rect.height / 2 - screenCenterY * newZoom,
      });
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2.0));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.2));

  if (isMobileView) {
    return (
      <div 
        className="w-full h-[calc(100vh-56px-56px)] overflow-y-auto bg-[var(--background)] flex flex-col items-center py-8 gap-8"
        style={{ marginTop: "56px", paddingBottom: "80px" }}
      >
        {screens.map((screen) => (
          <div key={screen.id} onClick={() => onSelectScreen(screen.id)}>
            <ScreenFrame
              screen={screen}
              layoutType={layoutType}
              isSelected={selectedScreenId === screen.id}
              isZoomed={true} // Always allow edit on mobile if selected
              isLoading={loadingScreenId === screen.id}
              scale={1}
              onSelect={() => onSelectScreen(screen.id)}
              onEditClick={onEditClick}
              onRegenerate={onRegenerate}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full absolute overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
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
    >
      <div
        className="absolute top-0 left-0 transition-transform duration-75 origin-top-left"
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
