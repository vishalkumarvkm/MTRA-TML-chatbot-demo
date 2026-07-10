"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { AGENT_PERSONAS } from "@/lib/chat/agentPersonas";
import type { ChatMessage } from "@/types";

export function ProactiveAlert() {
  const { 
    currentUser, 
    hasSentProactive, 
    setHasSentProactive, 
    addChatMessage, 
    setUnreadChatCount,
    isChatOpen
  } = useAppStore();

  useEffect(() => {
    if (currentUser && !hasSentProactive) {
      // Simulate proactive message based on role
      const persona = AGENT_PERSONAS[currentUser.role];
      let alertText = "";

      switch (currentUser.role) {
        case "employee":
          alertText = "Welcome back! You have 4 credits remaining this year. Your Fall 2026 application deadline is Dec 31.";
          break;
        case "manager":
          alertText = "Hello! You have 3 pending approvals in your queue. 1 application is marked as urgent.";
          break;
        case "hr":
          alertText = "Attention: 2 NYSNA cases are approaching the 45-day SLA breach threshold. Would you like to review them now?";
          break;
        case "admin":
          alertText = "System health check complete. 2 nodes reported minor latency spikes in the last hour, but all services are currently nominal.";
          break;
      }

      if (alertText) {
        const msg: ChatMessage = {
          id: `proactive-${Date.now()}`,
          role: "ai",
          text: alertText,
          timestamp: new Date().toISOString(),
          isProactive: true,
        };

        // Delay slightly to feel more natural
        const timer = setTimeout(() => {
          addChatMessage(msg);
          setHasSentProactive(true);
          if (!isChatOpen) {
            setUnreadChatCount(1);
          }
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, hasSentProactive, addChatMessage, setHasSentProactive, setUnreadChatCount, isChatOpen]);

  return null;
}
