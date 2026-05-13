"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Key, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";

export function SettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, apiKey, setApiKey } = useAppStore();
  const [showKey, setShowKey] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isSettingsOpen) {
      setInputValue(apiKey);
    }
  }, [isSettingsOpen, apiKey]);

  const handleSave = () => {
    setApiKey(inputValue.trim());
    setIsSettingsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    setApiKey("");
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API key for AI generation. Your key is stored locally and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key
            </label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="sk-ant-..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>Supports Anthropic (Claude) and OpenAI keys</span>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}