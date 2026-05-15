"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Sparkles, Download, Share2, Check, Loader2 } from "lucide-react";

export type ToolbarProps = {
  projectName: string;
  isPrototypeMode: boolean;
  hasScreens: boolean;
  saveStatus: 'idle' | 'saving' | 'saved';
  onGenerate: () => void;
  onTogglePrototypeMode: () => void;
  onExportAll: () => void;
  onShare: () => void;
  onRenameProject: (name: string) => void;
};

export function Toolbar({
  projectName,
  isPrototypeMode,
  hasScreens,
  saveStatus,
  onGenerate,
  onTogglePrototypeMode,
  onExportAll,
  onShare,
  onRenameProject,
}: ToolbarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditName(projectName);
  }, [projectName]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  const handleNameSubmit = () => {
    setIsEditingName(false);
    if (editName.trim() && editName.trim() !== projectName) {
      onRenameProject(editName.trim());
    } else {
      setEditName(projectName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
      setEditName(projectName);
    }
  };

  return (
    <div 
      className="fixed left-0 w-full z-40 flex items-center justify-between px-6 bg-[var(--surface)] border-b border-[var(--border)]"
      style={{ top: '56px', height: '56px' }}
    >
      <div className="flex items-center flex-1">
        {isEditingName ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        ) : (
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setIsEditingName(true)}
          >
            <span className="font-medium text-sm text-[var(--text-primary)]">{projectName}</span>
            <Pencil className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 flex-1">
        <Button 
          onClick={onGenerate} 
          className="bg-[var(--accent)] text-white hover:bg-indigo-600 gap-2 h-9 px-4"
        >
          <Sparkles className="w-4 h-4" />
          Generate
        </Button>
        <Button
          onClick={onTogglePrototypeMode}
          variant={isPrototypeMode ? "default" : "outline"}
          className={`gap-2 h-9 px-4 ${isPrototypeMode ? "bg-[var(--accent)] text-white hover:bg-indigo-600 border border-[var(--accent)]" : "border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)] bg-transparent"}`}
        >
          Prototype Mode
        </Button>
      </div>

      <div className="flex items-center justify-end gap-3 flex-1">
        {saveStatus === 'saving' && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mr-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Saving&hellip;</span>
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mr-2">
            <Check className="w-3 h-3" />
            <span>Saved</span>
          </div>
        )}
        
        <div 
          className="inline-flex cursor-not-allowed" 
          title={!hasScreens ? "Generate your app flow first" : undefined}
        >
          <Button 
            onClick={onExportAll} 
            disabled={!hasScreens}
            variant="outline"
            className="gap-2 h-9 px-3 border-[var(--border)] text-[var(--text-primary)] disabled:opacity-50 hover:bg-[var(--background)] hover:text-[var(--text-primary)] bg-transparent"
            style={{ pointerEvents: !hasScreens ? 'none' : 'auto' }}
          >
            <Download className="w-4 h-4" />
            Export All
          </Button>
        </div>

        <div 
          className="inline-flex cursor-not-allowed" 
          title={!hasScreens ? "Generate your app flow first" : undefined}
        >
          <Button 
            onClick={onShare} 
            disabled={!hasScreens}
            variant="outline"
            className="gap-2 h-9 px-3 border-[var(--border)] text-[var(--text-primary)] disabled:opacity-50 hover:bg-[var(--background)] hover:text-[var(--text-primary)] bg-transparent"
            style={{ pointerEvents: !hasScreens ? 'none' : 'auto' }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
