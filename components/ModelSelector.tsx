"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PROVIDERS } from "@/lib/models-registry";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ExternalLink, Search } from "lucide-react";

export function ModelSelector() {
  const {
    selectedProviderId,
    selectedModelId,
    apiKeys,
    setProvider,
    setModel,
    setApiKeyForProvider,
  } = useAppStore();

  const [modelSearch, setModelSearch] = useState("");

  const selectedProvider = PROVIDERS.find((p) => p.id === selectedProviderId);
  const currentApiKey = selectedProviderId ? apiKeys[selectedProviderId] || "" : "";
  const showWarning = selectedProviderId && !currentApiKey;
  const isOpenRouter = selectedProviderId === "openrouter";

  const filteredModels = useMemo(() => {
    if (!selectedProvider) return [];
    const query = modelSearch.toLowerCase().trim();
    if (!query) return selectedProvider.models;
    return selectedProvider.models.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query)
    );
  }, [selectedProvider, modelSearch]);

  const getModelsGroupedByType = () => {
    if (!selectedProvider) return null;
    if (isOpenRouter) {
      const freeModels = filteredModels.filter((m) => m.type === "free");
      const paidModels = filteredModels.filter((m) => m.type === "paid");
      return { free: freeModels, paid: paidModels };
    }
    return null;
  };

  const groupedModels = getModelsGroupedByType();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">API Provider</label>
        <Select
          value={selectedProviderId}
          onValueChange={(value) => {
            if (value) setProvider(value);
            setModelSearch("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            {PROVIDERS.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProviderId && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">AI Model</label>
          {isOpenRouter && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          )}
          <Select
            value={selectedModelId}
            onValueChange={(value) => setModel(value)}
            disabled={!selectedProviderId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {groupedModels ? (
                <>
                  <SelectGroup>
                    <SelectLabel>Free Models</SelectLabel>
                    {groupedModels.free.length > 0 ? (
                      groupedModels.free.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No free models match
                      </div>
                    )}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Paid Models</SelectLabel>
                    {groupedModels.paid.length > 0 ? (
                      groupedModels.paid.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No paid models match
                      </div>
                    )}
                  </SelectGroup>
                </>
              ) : filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No models match
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedProviderId && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {selectedProvider?.name} API Key
          </label>
          <Input
            type="password"
            placeholder={`Enter ${selectedProvider?.name} API Key`}
            value={currentApiKey}
            onChange={(e) => setApiKeyForProvider(selectedProviderId, e.target.value)}
          />
          {isOpenRouter && (
            <a
              href="https://openrouter.ai/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Get your OpenRouter API key <ExternalLink className="size-3" />
            </a>
          )}
          {showWarning && (
            <div className="flex items-center gap-2 text-amber-500 text-sm">
              <AlertTriangle className="size-4" />
              <span>API Key is required for this provider</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}