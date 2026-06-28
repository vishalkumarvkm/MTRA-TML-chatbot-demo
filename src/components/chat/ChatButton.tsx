"use client";

import { useAppStore } from "@/store/appStore";
import { AskAgentButton } from "./AskAgentButton";
import { usePathname } from "next/navigation";

export function ChatButton() {
  const { isChatOpen, unreadChatCount } = useAppStore();
  const pathname = usePathname();

  // Hide the floating button on the application wizard to avoid overlapping footer buttons
  if (pathname === "/apply") return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <AskAgentButton />
    </div>
  );
}
