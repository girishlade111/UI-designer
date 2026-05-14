"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/useAppStore";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { currentGeneratedCode } = useAppStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentGeneratedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewHTML = useMemo(() => {
    if (!currentGeneratedCode) return "";
    return generatePreviewHTML(currentGeneratedCode);
  }, [currentGeneratedCode]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-sm">Canvas</h2>
      </div>

      <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-border flex justify-center">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-1 m-0 p-4 min-h-0">
          <div className="h-full bg-white rounded-lg border border-border overflow-hidden">
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
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!currentGeneratedCode}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <ScrollArea className="h-full">
            <pre className="p-4 text-sm font-mono bg-zinc-950 text-zinc-100 min-h-full">
              {currentGeneratedCode || "// Generated code will appear here"}
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}