"use client";

import { Settings, Hexagon } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Hexagon className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Stitch</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Settings className="h-4 w-4" />
        <span className="sr-only">Settings</span>
      </Button>
    </header>
  );
}