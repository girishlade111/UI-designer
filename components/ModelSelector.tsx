"use client";

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
import { AlertTriangle } from "lucide-react";

export function ModelSelector() {
  const {
    selectedProviderId,
    selectedModelId,
    apiKeys,
    setProvider,
    setModel,
    setApiKeyForProvider,
  } = useAppStore();

  const selectedProvider = PROVIDERS.find((p) => p.id === selectedProviderId);
  const currentApiKey = selectedProviderId ? apiKeys[selectedProviderId] || "" : "";
  const showWarning = selectedProviderId && !currentApiKey;

  const getModelsGroupedByType = () => {
    if (!selectedProvider) return null;
    if (selectedProviderId === "openrouter") {
      const freeModels = selectedProvider.models.filter((m) => m.type === "free");
      const paidModels = selectedProvider.models.filter((m) => m.type === "paid");
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
          onValueChange={(value) => setProvider(value)}
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
                    {groupedModels.free.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Paid Models</SelectLabel>
                    {groupedModels.paid.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              ) : (
                selectedProvider?.models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))
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