"use client";

import { Navbar } from "@/components/navbar";
import { ResizablePanel } from "@/components/resizable-panel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CanvasPanel } from "@/components/canvas/CanvasPanel";

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <ResizablePanel
        leftPanel={<ChatPanel />}
        rightPanel={<CanvasPanel />}
        defaultLeftWidth={30}
        minLeftWidth={300}
        maxLeftWidth={60}
      />
    </div>
  );
}