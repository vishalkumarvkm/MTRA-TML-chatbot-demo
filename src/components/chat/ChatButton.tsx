"use client";

import { useAppStore } from "@/store/appStore";
import { usePathname } from "next/navigation";
import { AskAgentButton } from "./AskAgentButton";

export function ChatButton() {
  const { isAuthenticated, currentUser } = useAppStore();
  const pathname = usePathname();

  // Session authentication gate: must be logged in to view Co-Pilot button
  if (!isAuthenticated || !currentUser) return null;

  // Hide the floating button on the application wizard to avoid overlapping footer buttons
  if (pathname === "/apply") return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <AskAgentButton />
    </div>
  );
}
