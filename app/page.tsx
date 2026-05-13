"use client";

import { Navbar } from "@/components/navbar";
import { ResizablePanel } from "@/components/resizable-panel";
import { ChatPanel } from "@/components/chat/ChatPanel";

function RightPanel() {
  return (
    <div className="h-full relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Canvas / Preview Area</p>
          <p className="text-xs mt-1">Your generated UI will appear here</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <ResizablePanel
        leftPanel={<LeftPanel />}
        rightPanel={<RightPanel />}
        defaultLeftWidth={30}
        minLeftWidth={300}
        maxLeftWidth={60}
      />
    </div>
  );
}