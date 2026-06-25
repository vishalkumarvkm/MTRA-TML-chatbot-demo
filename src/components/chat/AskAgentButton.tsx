"use client";

import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AskAgentButtonProps {
  className?: string;
  size?: "sm" | "md";
  showText?: boolean;
}

export function AskAgentButton({ className, size = "md", showText = true }: AskAgentButtonProps) {
  const { isChatOpen, setIsChatOpen, unreadChatCount } = useAppStore();

  if (isChatOpen) return null;

  return (
    <button
      onClick={() => setIsChatOpen(!isChatOpen)}
      className={cn(
        "relative rounded-full shadow-lg flex items-center transition-all duration-300 pointer-events-auto active:scale-95 group",
        "bg-brand-black/95 backdrop-blur-md text-white hover:bg-brand-blue hover:shadow-[0_0_20px_rgba(0,148,128,0.4)] hover:-translate-y-0.5",
        "before:absolute before:inset-[-1.5px] before:rounded-full before:bg-brand-teal before:-z-10 before:opacity-70 group-hover:before:opacity-100 transition-opacity",
        size === "sm" ? "h-8 px-3 gap-2" : "h-12 px-5 gap-3",
        className
      )}
      data-ocid="ask_agent_button"
    >
      {showText && <span className={cn(size === "sm" ? "text-[11px]" : "text-sm", "font-bold tracking-tight whitespace-nowrap")}>Ask HealthyME Assistant</span>}

      {unreadChatCount > 0 && (
        <Badge 
          className={cn(
            "absolute bg-destructive text-white border-slate-900 flex items-center justify-center p-0 font-black shadow-lg",
            size === "sm" ? "-top-1 -right-0.5 min-w-[14px] h-[14px] text-[7px] border" : "-top-2 -right-1 min-w-[22px] h-[22px] text-[10px] border-2"
          )}
        >
          {unreadChatCount > 9 ? "9+" : unreadChatCount}
        </Badge>
      )}
    </button>
  );
}
