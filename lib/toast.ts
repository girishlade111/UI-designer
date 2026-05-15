import { toast } from "sonner";

export const TOASTS = {
  EXPORT_COMPLETE: "Downloaded! Open any .html file in your browser.",
  LINK_COPIED: "Prototype link copied to clipboard!",
  EDIT_APPLIED: "Edit applied to screen.",
  EDIT_FAILED: "Edit couldn't be applied. Try rephrasing.",
  GENERATION_FAILED: "Generation failed. Try simplifying your description.",
  AI_UNAVAILABLE: "AI service is temporarily unavailable. Try again in a few minutes.",
} as const;

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      className: "bg-green-500/10 border-green-500/20 text-green-500",
    });
  },
  error: (message: string) => {
    toast.error(message, {
      className: "bg-red-500/10 border-red-500/20 text-red-500",
    });
  },
  info: (message: string) => {
    toast(message, {
      className: "bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]",
    });
  },
};
