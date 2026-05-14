"use client";

import { useState, useMemo } from "react";
import prettier from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/useAppStore";
import { Copy, Check, Undo2, Redo2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Skeleton } from "@/components/ui/skeleton";

function generatePreviewHTML(code: string): string {
  const escapedCode = code.replace(/<\/script>/gi, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      ${escapedCode}
      
      const App = (${code.match(/export default function (\w+)/)?.[1] || 'App'}) || (${code.match(/export default (\w+)/)?.[1]}) || (typeof ${code.match(/const (\w+) = /)?.[1]} !== 'undefined' ? ${code.match(/const (\w+) = /)?.[1]} : null);
      
      if (App) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
      }
    } catch (err) {
      document.body.innerHTML = '<div style="color: #dc2626; padding: 20px; font-family: monospace; white-space: pre-wrap;">' + err.message + '</div>';
    }
  </script>
</body>
</html>`;
}

export function CanvasPanel() {
  const { currentGeneratedCode, undoCode, redoCode, historyIndex, codeHistory, isGenerating } = useAppStore();
  const [copied, setCopied] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < codeHistory.length - 1;

  const formattedCode = useMemo(() => {
    if (!currentGeneratedCode) return "";
    try {
      return prettier.format(currentGeneratedCode, {
        parser: "babel-ts",
        plugins: [babelPlugin, estreePlugin],
        semi: true,
        singleQuote: true,
        tabWidth: 2,
      });
    } catch {
      return currentGeneratedCode;
    }
  }, [currentGeneratedCode]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedCode], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Component.tsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewHTML = useMemo(() => {
    if (!currentGeneratedCode) return "";
    return generatePreviewHTML(currentGeneratedCode);
  }, [currentGeneratedCode]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-sm">Canvas</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={undoCode}
            disabled={!canUndo}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={redoCode}
            disabled={!canRedo}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-border flex justify-center">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-1 m-0 p-4 min-h-0">
          <div className="h-full bg-white rounded-lg border border-border overflow-hidden relative">
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Generating...</span>
                </div>
              </div>
            )}
            {currentGeneratedCode ? (
              <iframe
                srcDoc={previewHTML}
                className="w-full h-full border-0"
                title="Preview"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Generate code to see preview
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 m-0 min-h-0 relative">
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!formattedCode}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!formattedCode}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          <ScrollArea className="h-full">
            {formattedCode ? (
              <SyntaxHighlighter
                language="tsx"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  fontSize: "0.875rem",
                  background: "#1e1e1e",
                  minHeight: "100%",
                }}
                showLineNumbers
              >
                {formattedCode}
              </SyntaxHighlighter>
            ) : (
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/6" />
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}