"use client";

import { LayoutType } from "@/types/project";
import { ChevronLeft } from "lucide-react";

export type DeviceFrameProps = {
  layoutType: LayoutType;
  scale: number;
  canGoBack: boolean;
  onBack: () => void;
  children: React.ReactNode;
};

export function DeviceFrame({
  layoutType,
  scale,
  canGoBack,
  onBack,
  children,
}: DeviceFrameProps) {
  if (layoutType === "mobile") {
    return (
      <div
        className="flex items-center justify-center transition-transform origin-center"
        style={{ transform: `scale(${scale})` }}
      >
        <div
          className="relative bg-[var(--surface)] shadow-2xl overflow-hidden"
          style={{
            width: "410px",
            height: "880px",
            borderRadius: "40px",
            border: "10px solid #222",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#222] rounded-b-xl z-20" />
          
          {/* Content Area */}
          <div
            className="absolute top-[18px] left-[10px] bg-white overflow-hidden"
            style={{ width: "390px", height: "844px", borderRadius: "30px" }}
          >
            {children}
            
            {/* Back Button Overlay */}
            {canGoBack && (
              <button
                onClick={onBack}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-30 hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1 -ml-1" />
                Back
              </button>
            )}
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-20 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center transition-transform origin-center"
      style={{ transform: `scale(${scale})` }}
    >
      <div
        className="relative bg-[var(--surface)] shadow-2xl rounded-xl overflow-hidden border border-[var(--border)]"
        style={{ width: "1280px", height: "840px" }} // 800 content + 40 bar
      >
        {/* Browser Chrome */}
        <div
          className="w-full h-[40px] bg-[#222] flex items-center px-4 border-b border-[#333] shrink-0 relative"
        >
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          
          {/* URL Bar */}
          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[400px] h-6 bg-[#111] rounded text-[10px] text-gray-400 flex items-center justify-center font-medium font-mono">
            design.ladestack.in
          </div>
        </div>

        {/* Content Area */}
        <div
          className="w-full h-[800px] bg-white overflow-hidden relative"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
