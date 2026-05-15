"use client";

import { useState } from "react";
import { Screen, Connection } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Link2, X, Plus, LayoutPanelTop, Zap } from "lucide-react";

export type ConnectionsPanelProps = {
  screens: Screen[];
  connections: Connection[];
  selectedScreenId: string | null;
  onSelectScreen: (screenId: string) => void;
  onAddConnection: (fromId: string, toId: string, trigger: string) => void;
  onDeleteConnection: (connectionId: string) => void;
};

export function ConnectionsPanel({
  screens,
  connections,
  selectedScreenId,
  onSelectScreen,
  onAddConnection,
  onDeleteConnection,
}: ConnectionsPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [trigger, setTrigger] = useState<string>("");

  const getScreenName = (id: string) => {
    return screens.find((s) => s.id === id)?.name || "Unknown";
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId) return;
    onAddConnection(fromId, toId, trigger);
    setIsAdding(false);
    setFromId("");
    setToId("");
    setTrigger("");
  };

  const getSuggestion = () => {
    for (let i = 0; i < screens.length - 1; i++) {
      const s1 = screens[i];
      const s2 = screens[i + 1];
      const name1 = s1.name.toLowerCase();
      const name2 = s2.name.toLowerCase();
      
      const hasConnection = connections.some(
        (c) => c.fromScreenId === s1.id && c.toScreenId === s2.id
      );

      if (!hasConnection) {
        if (
          (name1.includes("login") && (name2.includes("dash") || name2.includes("home"))) ||
          (name1.includes("cart") && name2.includes("checkout")) ||
          (name1.includes("home") && name2.includes("detail")) ||
          (name1.includes("product") && name2.includes("cart"))
        ) {
          return { from: s1, to: s2 };
        }
      }
    }
    return null;
  };

  const suggestion = getSuggestion();

  return (
    <div className="fixed left-0 top-[56px] bottom-0 w-[240px] bg-[var(--surface)] border-r border-[var(--border)] z-40 flex flex-col animate-in slide-in-from-left duration-300 ease-out">
      <div className="p-4 border-b border-[var(--border)] shrink-0 bg-[var(--surface)] relative z-10">
        <h3 className="font-bold text-[var(--text-primary)]">Prototype Connections</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Click elements on a screen, then connect them to another screen.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Screen List */}
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Screens
          </h4>
          <div className="flex flex-col gap-1">
            {screens.map((screen) => (
              <button
                key={screen.id}
                onClick={() => onSelectScreen(screen.id)}
                className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                  selectedScreenId === screen.id
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-primary)] hover:bg-[var(--background)]"
                }`}
              >
                <LayoutPanelTop className={`w-4 h-4 ${selectedScreenId === screen.id ? "text-white" : "text-gray-400"}`} />
                <span className="truncate">{screen.name}</span>
              </button>
            ))}
            {screens.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] italic">No screens yet.</p>
            )}
          </div>
        </div>

        {/* Suggestion Banner */}
        {suggestion && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3 h-3" />
              Suggestion
            </div>
            <p className="text-sm text-[var(--text-primary)]">
              Connect <strong>{suggestion.from.name}</strong> &rarr; <strong>{suggestion.to.name}</strong>?
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-1 bg-transparent border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 h-7"
              onClick={() => onAddConnection(suggestion.from.id, suggestion.to.id, "auto-suggested")}
            >
              Add Connection
            </Button>
          </div>
        )}

        {/* Connections List */}
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Connections
          </h4>
          <div className="flex flex-col gap-2">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="flex items-center justify-between bg-[var(--background)] border border-[var(--border)] rounded-md px-2 py-1.5 text-sm"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <Link2 className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                  <span className="truncate text-[var(--text-primary)] text-xs">
                    {getScreenName(conn.fromScreenId)} &rarr; {getScreenName(conn.toScreenId)}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteConnection(conn.id)}
                  className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1"
                  title="Remove connection"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {connections.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] italic">No connections yet.</p>
            )}
          </div>
        </div>

        {/* Add Connection Form */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">New Connection</h4>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[var(--text-muted)] uppercase">From Screen</label>
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                required
              >
                <option value="" disabled>Select screen...</option>
                {screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[var(--text-muted)] uppercase">To Screen</label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                required
              >
                <option value="" disabled>Select screen...</option>
                {screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[var(--text-muted)] uppercase">Trigger Element (Optional)</label>
              <input
                type="text"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="e.g. Login button"
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex gap-2 mt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1 h-7 text-xs bg-transparent border-[var(--border)]" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex-1 h-7 text-xs bg-[var(--accent)] text-white hover:bg-indigo-600">
                Save
              </Button>
            </div>
          </form>
        )}
      </div>

      {!isAdding && (
        <div className="p-4 border-t border-[var(--border)] shrink-0 bg-[var(--surface)]">
          <Button 
            onClick={() => setIsAdding(true)}
            variant="outline" 
            className="w-full gap-2 bg-transparent border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)]"
          >
            <Plus className="w-4 h-4" />
            Add Connection
          </Button>
        </div>
      )}
    </div>
  );
}
