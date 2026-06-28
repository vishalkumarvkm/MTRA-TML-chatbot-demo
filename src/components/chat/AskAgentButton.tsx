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
          "relative rounded-full shadow-[0_4px_12px_rgba(0,55,105,0.3)] flex items-center justify-center transition-all duration-300 pointer-events-auto active:scale-95 group",
          "bg-[#003769] text-white hover:bg-[#00254a] hover:-translate-y-0.5 w-8 h-8",
          className
        )}
        data-ocid="ask_agent_button"
      >
        <Sparkles className="text-white w-4 h-4" />
        {unreadChatCount > 0 && (
          <Badge className="absolute bg-destructive text-white border-slate-900 flex items-center justify-center p-0 font-black shadow-lg -top-1 -right-0.5 min-w-[14px] h-[14px] text-[7px] border">
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
        "relative rounded-full shadow-[0_6px_20px_rgba(0,55,105,0.35)] flex flex-col items-center justify-center text-center transition-all duration-300 pointer-events-auto active:scale-95 group",
        "bg-[#003769] text-white hover:bg-[#00254a] hover:-translate-y-0.5",
        "w-24 h-24 p-3 leading-tight font-bold text-[10px] uppercase tracking-wider",
        className
      )}
      data-ocid="ask_agent_button"
    >
      <span className="block">Ask your</span>
      <span className="block text-[11px]">Tuition</span>
      <span className="block text-[11px]">Navigation</span>
      <span className="block">Agent</span>

      {unreadChatCount > 0 && (
        <Badge 
          className="absolute bg-destructive text-white border-slate-900 flex items-center justify-center p-0 font-black shadow-lg -top-1.5 -right-1.5 min-w-[22px] h-[22px] text-[10px] border-2"
        >
          {unreadChatCount > 9 ? "9+" : unreadChatCount}
        </Badge>
      )}
    </button>
  );
}
