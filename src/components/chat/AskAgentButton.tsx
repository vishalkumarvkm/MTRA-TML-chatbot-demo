"use client";

import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface AskAgentButtonProps {
  className?: string;
  size?: "sm" | "md";
}

export function AskAgentButton({ className, size = "md" }: AskAgentButtonProps) {
  const { isChatOpen, setIsChatOpen, unreadChatCount } = useAppStore();

  if (isChatOpen) return null;

  if (size === "sm") {
    return (
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={cn(
          "relative rounded-full shadow-[0_4px_12px_rgba(0,55,105,0.3)] flex items-center gap-1.5 transition-all duration-300 pointer-events-auto active:scale-95 group",
          "bg-[#003769] text-white hover:bg-[#00254a] hover:-translate-y-0.5 px-3 h-8 text-[10px] font-bold font-body",
          className
        )}
        title="Open HealthyME Navigator"
        data-ocid="ask_agent_button"
      >
        <Sparkles className="text-white w-3.5 h-3.5" />
        <span>HealthyME Navigator</span>
        {unreadChatCount > 0 && (
          <Badge className="bg-destructive text-white border-slate-900 flex items-center justify-center p-0 font-bold shadow-lg min-w-[14px] h-[14px] text-[8px] rounded-full">
            {unreadChatCount}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => setIsChatOpen(!isChatOpen)}
      className={cn(
        "relative rounded-full shadow-[0_6px_20px_rgba(0,55,105,0.35)] flex items-center gap-2 transition-all duration-300 pointer-events-auto active:scale-95 group",
        "bg-[#003769] text-white hover:bg-[#00254a] hover:-translate-y-0.5 px-5 h-11 text-xs font-bold font-body",
        className
      )}
      title="Open HealthyME Navigator"
      data-ocid="ask_agent_button"
    >
      <Sparkles className="text-white w-4 h-4 animate-pulse group-hover:scale-110 transition-transform" />
      <span>HealthyME Navigator</span>
      {unreadChatCount > 0 && (
        <Badge 
          className="bg-destructive text-white border-slate-900 flex items-center justify-center p-0 font-bold shadow-lg min-w-[20px] h-[20px] text-[10px] rounded-full border"
        >
          {unreadChatCount > 9 ? "9+" : unreadChatCount}
        </Badge>
      )}
    </button>
  );
}
