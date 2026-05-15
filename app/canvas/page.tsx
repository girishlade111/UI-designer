"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Project, LayoutType, Screen } from "@/types/project";
import { Toolbar } from "@/components/editor/Toolbar";
import { InfiniteCanvas } from "@/components/canvas/InfiniteCanvas";
import { ChatPanel } from "@/components/editor/ChatPanel";
import { ConnectionsPanel } from "@/components/prototype/ConnectionsPanel";
import { GenerationLoader } from "@/components/canvas/GenerationLoader";
import { Button } from "@/components/ui/button";
import { showToast, TOASTS } from "@/lib/toast";

function CanvasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [isPrototypeMode, setIsPrototypeMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewCurrentScreenId, setPreviewCurrentScreenId] = useState<string | null>(null);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingScreenId, setLoadingScreenId] = useState<string | null>(null);
  
  // Viewport/Canvas tracking state
  const [canvasZoom, setCanvasZoom] = useState(1.0);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [revealedScreenNames, setRevealedScreenNames] = useState<string[]>([]);
  const [editCountMap, setEditCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    const layoutParam = searchParams.get('layout') as LayoutType | null;

    if (promptParam) {
      const decodedPrompt = decodeURIComponent(promptParam);
      const name = decodedPrompt.split(' ').slice(0, 5).join(' ') || "Untitled Project";
      const newProject: Project = {
        id: crypto.randomUUID(),
        name,
        originalPrompt: decodedPrompt,
        layoutType: layoutParam === 'web' ? 'web' : 'mobile',
        screens: [],
        connections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProject(newProject);
      handleGenerate(newProject); // Call generation immediately
      // Remove query params to avoid re-triggering on refresh
      router.replace('/canvas');
    } else {
      const saved = localStorage.getItem('ladedesign_project');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProject(parsed);
          if (parsed.screens.length === 0) {
            setIsGenerateModalOpen(true);
          }
        } catch (e) {
          console.error("Failed to parse saved project");
        }
      } else {
        // Fallback empty project to render the empty canvas
        setProject({
          id: crypto.randomUUID(),
          name: "Untitled Project",
          originalPrompt: "",
          layoutType: "mobile",
          screens: [],
          connections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setIsGenerateModalOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async (overrideProject?: Project) => {
    const targetProject = overrideProject || project;
    if (!targetProject) return;

    setIsGenerating(true);
    setRevealedScreenNames([]);
    setIsChatPanelOpen(false);
    setIsGenerateModalOpen(false);

    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setRevealedScreenNames(["Identifying your app screens…"]), 2000));
    timers.push(setTimeout(() => setRevealedScreenNames(["Identifying your app screens…", "Login", "Dashboard", "Settings"]), 4000));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: targetProject.originalPrompt, layoutType: targetProject.layoutType }),
      });

      if (!res.ok) {
        throw new Error(res.status === 503 ? "AI_UNAVAILABLE" : "GENERATION_FAILED");
      }

      const data = await res.json();
      
      const newScreens: Screen[] = Object.entries(data.screens || {}).map(([name, htmlContent], index) => {
        const contentStr = htmlContent as string;
        const isValid = contentStr.includes("<html") && contentStr.length > 200;
        return {
          id: crypto.randomUUID(),
          name,
          htmlContent: isValid ? contentStr : "",
          displayOrder: index + 1,
          editHistory: [],
        };
      });

      const updatedProject = { ...targetProject, screens: newScreens, updatedAt: new Date().toISOString() };
      setProject(updatedProject);
      localStorage.setItem('ladedesign_project', JSON.stringify(updatedProject));
    } catch (error) {
      if (error instanceof Error && error.message === "AI_UNAVAILABLE") {
        showToast.error(TOASTS.AI_UNAVAILABLE);
      } else {
        showToast.error(TOASTS.GENERATION_FAILED);
      }
    } finally {
      timers.forEach(clearTimeout);
      setIsGenerating(false);
    }
  };

  const handleApplyEdit = (instruction: string) => {
    // TODO: built in Prompt 21
    setIsEditing(true);
    setTimeout(() => setIsEditing(false), 1000); 
  };

  const handleUndo = (screenId: string) => {
    // TODO: built in Prompt 21
  };

  const handleExportAll = () => {
    // TODO: built in Prompt 26
  };

  const handleShare = () => {
    // TODO: built in Prompt 27
  };

  const handleTogglePrototypeMode = () => {
    setIsPrototypeMode(!isPrototypeMode);
    if (!isPrototypeMode) {
      setIsChatPanelOpen(false); // Auto close chat panel if opening prototype mode
    }
  };

  const handleSelectScreen = (screenId: string | null) => {
    setSelectedScreenId(screenId);
    if (screenId && !isPrototypeMode) {
      setIsChatPanelOpen(true);
    } else if (!screenId) {
      setIsChatPanelOpen(false);
    }
  };

  const handleRenameProject = (name: string) => {
    if (project) {
      setProject({ ...project, name, updatedAt: new Date().toISOString() });
    }
  };

  const handleAddConnection = (fromId: string, toId: string, trigger: string) => {
    // TODO: built in Prompt 23
    if (!project) return;
    const newConnection = {
      id: crypto.randomUUID(),
      fromScreenId: fromId,
      toScreenId: toId,
      triggerElement: trigger,
    };
    setProject({ ...project, connections: [...project.connections, newConnection] });
  };

  const handleDeleteConnection = (connectionId: string) => {
    if (!project) return;
    setProject({ ...project, connections: project.connections.filter(c => c.id !== connectionId) });
  };

  const handleRegenerate = (screenId: string) => {
    // TODO
  };

  const selectedScreen = project?.screens.find(s => s.id === selectedScreenId) || null;
  const editCount = selectedScreenId ? (editCountMap[selectedScreenId] || 0) : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[var(--background)] overflow-hidden relative">
      <Toolbar 
        projectName={project?.name || "Untitled Project"}
        isPrototypeMode={isPrototypeMode}
        hasScreens={project ? project.screens.length > 0 : false}
        saveStatus={saveStatus}
        onGenerate={() => setIsGenerateModalOpen(true)}
        onTogglePrototypeMode={handleTogglePrototypeMode}
        onExportAll={handleExportAll}
        onShare={handleShare}
        onRenameProject={handleRenameProject}
      />
      
      <div className="flex flex-row flex-1 overflow-hidden relative">
        {isPrototypeMode && (
          <ConnectionsPanel 
            screens={project?.screens || []}
            connections={project?.connections || []}
            selectedScreenId={selectedScreenId}
            onSelectScreen={handleSelectScreen}
            onAddConnection={handleAddConnection}
            onDeleteConnection={handleDeleteConnection}
          />
        )}

        <div className="flex-1 relative">
          <InfiniteCanvas 
            screens={project?.screens || []}
            layoutType={project?.layoutType || 'mobile'}
            selectedScreenId={selectedScreenId}
            isPrototypeMode={isPrototypeMode}
            onSelectScreen={handleSelectScreen}
            onEditClick={() => setIsChatPanelOpen(true)}
            onRegenerate={handleRegenerate}
            loadingScreenId={loadingScreenId}
          />
        </div>

        <ChatPanel 
          isOpen={isChatPanelOpen}
          isEditing={isEditing}
          selectedScreen={selectedScreen}
          editCount={editCount}
          onClose={() => setIsChatPanelOpen(false)}
          onApplyEdit={handleApplyEdit}
          onUndo={handleUndo}
        />
      </div>

      <GenerationLoader 
        isLoading={isGenerating}
        revealedScreenNames={revealedScreenNames}
        onCancel={() => setIsGenerating(false)}
      />

      {isGenerateModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 w-full max-w-[560px] shadow-2xl flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Generate App Flow</h2>
            
            {project && project.screens.length > 0 && (
              <p className="text-amber-500 text-sm font-medium">This will replace your current screens.</p>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--text-muted)] font-medium uppercase">App Description</label>
              <textarea
                value={project?.originalPrompt || ""}
                onChange={(e) => setProject(prev => prev ? { ...prev, originalPrompt: e.target.value } : prev)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setProject(prev => prev ? { ...prev, layoutType: "mobile" } : prev)}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  project?.layoutType === "mobile" 
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white" 
                    : "bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                📱 Mobile App
              </button>
              <button
                onClick={() => setProject(prev => prev ? { ...prev, layoutType: "web" } : prev)}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  project?.layoutType === "web" 
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white" 
                    : "bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                🖥 Web App
              </button>
            </div>

            <div className="flex gap-3 mt-2">
              {project && project.screens.length > 0 && (
                <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)} className="flex-1 bg-transparent border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)]">
                  Cancel
                </Button>
              )}
              <Button 
                onClick={() => handleGenerate()} 
                disabled={!project?.originalPrompt.trim() || isGenerating}
                className="flex-1 bg-[var(--accent)] text-white hover:bg-indigo-600 disabled:opacity-50"
              >
                Generate Flow &rarr;
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* {isPreviewMode && <PrototypePreview />} */}
    </div>
  );
}

export default function CanvasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--text-muted)] bg-[var(--background)]">Loading...</div>}>
      <CanvasContent />
    </Suspense>
  );
}

