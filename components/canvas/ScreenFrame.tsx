"use client";

import { Screen, LayoutType } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Sparkles } from 'lucide-react';

export type ScreenFrameProps = {
  screen: Screen;
  layoutType: LayoutType;
  isSelected: boolean;
  isZoomed: boolean;
  isLoading: boolean;
  scale: number;
  onSelect: (screenId: string) => void;
  onEditClick: () => void;
  onRegenerate: (screenId: string) => void;
};

export function ScreenFrame({
  screen,
  layoutType,
  isSelected,
  isZoomed,
  isLoading,
  scale,
  onSelect,
  onEditClick,
  onRegenerate,
}: ScreenFrameProps) {
  const width = layoutType === 'mobile' ? 390 : 1280;
  const height = layoutType === 'mobile' ? 844 : 800;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(screen.id);
  };

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${width}px`,
      }}
      className="flex flex-col gap-2 relative transition-transform duration-200"
    >
      <div className="text-sm text-[var(--text-muted)] font-medium">
        Screen {screen.displayOrder}: {screen.name}
      </div>

      <div 
        onClick={handleSelect}
        className={`relative rounded-xl overflow-hidden cursor-pointer transition-colors duration-200 bg-[var(--surface)]
          ${isSelected ? 'border-[2px] border-[var(--accent)]' : 'border-[2px] border-transparent hover:border-[var(--border)]'}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {screen.htmlContent === "" ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-6 bg-[var(--background)]">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
            <div>
              <p className="text-[var(--text-primary)] font-medium mb-1">{screen.name}</p>
              <p className="text-[var(--text-muted)] text-sm mb-4">Generation failed or returned empty content.</p>
            </div>
            <Button onClick={(e) => { e.stopPropagation(); onRegenerate(screen.id); }} variant="outline" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Regenerate this screen
            </Button>
          </div>
        ) : (
          <>
            <iframe
              key={`${screen.id}-${screen.editHistory.length}`}
              srcDoc={screen.htmlContent}
              sandbox="allow-same-origin"
              className="w-full h-full bg-white border-none"
              title={`Screen: ${screen.name}`}
            />
            {/* Click shield overlay to capture clicks safely over the iframe */}
            <div className="absolute inset-0 z-0 pointer-events-auto" />
          </>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Edit Button */}
        {isSelected && isZoomed && !isLoading && screen.htmlContent !== "" && (
          <div className="absolute top-4 right-4 z-20 pointer-events-auto">
            <Button 
              size="sm" 
              className="bg-[var(--accent)] text-white hover:bg-indigo-600 shadow-lg gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick();
              }}
            >
              <Sparkles className="w-3 h-3" />
              Edit with AI
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
