"use client";

import { Navbar } from "@/components/navbar";
import { ResizablePanel } from "@/components/resizable-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square, Play, Download } from "lucide-react";

function LeftPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm">Chat & Controls</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Describe what you want to build, and I&apos;ll help you create it.</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Welcome!</p>
            <p className="text-muted-foreground">Start by typing a prompt to begin designing.</p>
          </div>
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border">
        <div className="relative">
          <Textarea
            placeholder="Describe your UI..."
            className="min-h-[80px] resize-none pr-12"
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 border-t border-border flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Square className="h-4 w-4 mr-2" />
          Stop
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Play className="h-4 w-4 mr-2" />
          Run
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}

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