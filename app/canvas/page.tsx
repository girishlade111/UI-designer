"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Project, LayoutType } from "@/types/project";
import { Toolbar } from "@/components/editor/Toolbar";
import { InfiniteCanvas } from "@/components/canvas/InfiniteCanvas";
import { ChatPanel } from "@/components/editor/ChatPanel";
import { ConnectionsPanel } from "@/components/prototype/ConnectionsPanel";
import { GenerationLoader } from "@/components/canvas/GenerationLoader";

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
      handleGenerate(); // Call generation immediately
      // Remove query params to avoid re-triggering on refresh
      router.replace('/canvas');
    } else {
      const saved = localStorage.getItem('ladedesign_project');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProject(parsed);
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = () => {
    // TODO: built in Prompt 18
    setIsGenerating(true);
    setRevealedScreenNames(["Login", "Dashboard"]); // stub dummy data
    setTimeout(() => {
      setIsGenerating(false);
      setRevealedScreenNames([]);
    }, 2000);
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
        onGenerate={handleGenerate}
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
