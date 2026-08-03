"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";

interface AskAgentButtonProps {
  className?: string;
  size?: "sm" | "md";
}

export function AskAgentButton({
  className,
  size = "md",
}: AskAgentButtonProps) {
  const { isChatOpen, setIsChatOpen, unreadChatCount } = useAppStore();

  if (isChatOpen) return null;

  if (size === "sm") {
    return (
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={cn(
          "relative rounded-full shadow-[0_4px_12px_rgba(0,55,105,0.3)] flex flex-col items-center justify-center transition-all duration-300 pointer-events-auto active:scale-95 group",
          "bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 w-16 h-16 border border-white/10",
          className,
        )}
        title="Open HealthyME Navigator"
        data-ocid="ask_agent_button"
      >
        <span className="text-[8px] font-bold leading-tight text-center block text-white">
          HealthyME
          <br />
          <span className="text-[7px] text-white">Navigator</span>
        </span>
        {unreadChatCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-md">
            {unreadChatCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => setIsChatOpen(!isChatOpen)}
      className={cn(
        "relative rounded-full shadow-[4px_8px_20px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center text-center p-2 transition-all duration-300 pointer-events-auto active:scale-95 group",
        "bg-[#00274d] text-white hover:bg-[#001f3f] hover:-translate-y-1 w-24 h-24 border border-white/20",
        className,
      )}
      title="Ask your HealthyME Tuition Navigator"
      data-ocid="ask_agent_button"
    >
      <span className="text-[10px] font-bold leading-tight text-center block text-white uppercase tracking-tight">
        HealthyME
        <br />
        Navigator
      </span>
      {unreadChatCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#008573] text-white border-white flex items-center justify-center p-0 font-bold shadow-lg w-5 h-5 text-[9px] rounded-full border">
          {unreadChatCount > 9 ? "9+" : unreadChatCount}
        </span>
      )}
    </button>
  );
}
