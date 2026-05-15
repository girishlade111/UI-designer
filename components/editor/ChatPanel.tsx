"use client";

import { useState, useRef, useEffect } from "react";
import { Screen } from "@/types/project";
import { Button } from "@/components/ui/button";
import { X, Loader2, Undo2, MousePointer2 } from "lucide-react";

export type ChatPanelProps = {
  isOpen: boolean;
  isEditing: boolean;
  selectedScreen: Screen | null;
  editCount: number;
  onClose: () => void;
  onApplyEdit: (instruction: string) => void;
  onUndo: (screenId: string) => void;
};

export function ChatPanel({
  isOpen,
  isEditing,
  selectedScreen,
  editCount,
  onClose,
  onApplyEdit,
  onUndo,
}: ChatPanelProps) {
  const [instruction, setInstruction] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedScreen?.editHistory.length, isEditing]);

  const handleSubmit = () => {
    if (!instruction.trim() || isEditing) return;
    onApplyEdit(instruction.trim());
    setInstruction("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`fixed right-0 top-[56px] bottom-0 w-[320px] bg-[var(--surface)] border-l border-[var(--border)] z-50 flex flex-col transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)] shrink-0">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">
            {selectedScreen ? `Editing: ${selectedScreen.name}` : "Editor"}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Type an instruction to modify this screen
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-[var(--background)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!selectedScreen ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[var(--text-muted)]">
          <MousePointer2 className="w-8 h-8 mb-3 opacity-50" />
          <p>Select a screen to edit it.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            {selectedScreen.editHistory.map((_, index) => (
              <div key={index} className="flex flex-col gap-3">
                {/* User side */}
                <div className="flex justify-end">
                  <div className="bg-[var(--accent)] text-white px-3 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[85%] break-words">
                    Previous edit instruction #{index + 1}
                  </div>
                </div>
                {/* AI side */}
                <div className="flex justify-start">
                  <div className="bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2 rounded-2xl rounded-tl-sm text-sm flex items-center gap-2">
                    <span>Applied</span>
                    <span className="text-green-500">✓</span>
                  </div>
                </div>
              </div>
            ))}
            
            {isEditing && (
              <div className="flex justify-start">
                <div className="bg-[var(--background)] border border-[var(--border)] text-[var(--text-muted)] px-3 py-2 rounded-2xl rounded-tl-sm text-sm flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Applying edit...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[var(--border)] shrink-0 bg-[var(--surface)] flex flex-col gap-3">
            {selectedScreen.editHistory.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={() => onUndo(selectedScreen.id)}
                  disabled={isEditing}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                >
                  <Undo2 className="w-3 h-3" />
                  ↩ Undo last edit
                </button>
              </div>
            )}

            {editCount >= 15 && (
              <p className="text-xs text-amber-500 text-center">
                15 edits used. Refresh the page to reset.
              </p>
            )}

            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isEditing}
              placeholder="e.g. Make the header dark navy, add a search bar at the top"
              className="w-full resize-none bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50"
              rows={3}
            />
            
            <Button
              onClick={handleSubmit}
              disabled={isEditing || !instruction.trim()}
              className="w-full bg-[var(--accent)] text-white hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-[var(--accent)] gap-2"
            >
              {isEditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying Edit...
                </>
              ) : (
                "Apply Edit"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
