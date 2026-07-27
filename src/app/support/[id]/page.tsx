"use client";

import { Layout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockApplications, mockEmployees } from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import type { SupportCaseMessage } from "@/types";
import {
  ArrowLeft,
  Bold,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Italic,
  Link as LinkIcon,
  Lock,
  MessageSquare,
  Paperclip,
  PlusCircle,
  Send,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

const ADMINISTRATORS = ["System Admin", "Derek Chen", "Sarah Kim"];

export default function SupportCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser, supportCases, updateSupportCase } = useAppStore();
  const [replyText, setReplyText] = useState("");
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, boolean>
  >({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const getAvatarColorClass = (role: string) => {
    switch (role) {
      case "employee":
        return "bg-[#003769]";
      case "manager":
        return "bg-[#B8640A]";
      case "admin":
        return "bg-[#1A5E35]";
      default:
        return "bg-[#0D2B4E]";
    }
  };

  const toggleMessage = (msgId: string) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === undefined ? false : !prev[msgId],
    }));
  };

  const supportCase = supportCases.find((sc) => sc.id === id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [supportCase?.messages]);

  if (!currentUser) return null;

  if (!supportCase) {
    return (
      <Layout title="Case Not Found">
        <div className="p-12 text-center space-y-4">
          <p className="text-sm font-bold text-destructive">
            Support Case not found.
          </p>
          <Button variant="outline" onClick={() => router.push("/support")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Support Cases
          </Button>
        </div>
      </Layout>
    );
  }

  const userRole = currentUser.role;

  // Find corresponding employee details in database
  const currentEmployee = currentUser;

  // Check if role is authorized to view
  const canView =
    userRole === "admin" ||
    (userRole === "employee" &&
      (supportCase.employeeId === currentEmployee.id ||
        supportCase.employeeId === currentUser.employeeId ||
        supportCase.employeeId === "emp-001")) ||
    userRole === "manager"; // managers can view cases linked to reports

  if (!canView) {
    return (
      <Layout title="Access Denied">
        <div className="p-12 text-center space-y-4 font-body">
          <p className="text-sm font-bold text-destructive">
            You are not authorized to view this support case.
          </p>
          <Button variant="outline" onClick={() => router.push("/support")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Support Cases
          </Button>
        </div>
      </Layout>
    );
  }

  const handleSendMessage = (isInternal = false) => {
    if (!replyText.trim()) return;

    const newMsg: SupportCaseMessage = {
      id: `msg-${Date.now()}`,
      senderName: currentUser.name,
      senderRole: userRole as "employee" | "manager" | "admin" | "system",
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
      isInternal,
    };

    updateSupportCase(supportCase.id, {
      messages: [...supportCase.messages, newMsg],
    });
    setReplyText("");
  };

  const handleEscalate = () => {
    const escMsg: SupportCaseMessage = {
      id: `msg-esc-${Date.now()}`,
      senderName: currentUser.name,
      senderRole: "manager",
      message:
        "[Escalation Alert] Unit Manager has flagged this ticket as 'Unable to Resolve' and escalated it to HR Specialists for policy exception review.",
      timestamp: new Date().toISOString(),
    };

    updateSupportCase(supportCase.id, {
      status: "In Progress",
      assignedTo: "Priya Nair",
      messages: [...supportCase.messages, escMsg],
    });
  };

  const handleReopen = () => {
    const reopenMsg: SupportCaseMessage = {
      id: `msg-reopen-${Date.now()}`,
      senderName: currentUser.name,
      senderRole: "employee",
      message: "[System Log] Case re-opened by employee.",
      timestamp: new Date().toISOString(),
    };

    updateSupportCase(supportCase.id, {
      status: "Open",
      reopenedFlag: true,
      reopenedDate: new Date().toISOString(),
      messages: [...supportCase.messages, reopenMsg],
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "In Progress":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Resolved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Closed":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout
      title={`Support Case ${supportCase.id}`}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Support Cases", href: "/support" },
        { label: supportCase.id },
      ]}
      disableScroll={true}
    >
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 lg:overflow-hidden bg-[#F3F4F6] font-body">
        {/* Main Conversational Thread Area */}
        <main className="flex-grow flex flex-col min-w-0 h-[600px] lg:h-full overflow-hidden bg-card">
          {/* Thread Header Card */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-border bg-white flex-shrink-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/support")}
                className="h-8 px-2 -ml-2 text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to list
              </Button>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-[#0D2B4E] mb-2 leading-snug">
              {supportCase.subject}
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-bold">
                  {supportCase.id}
                </span>
                <span className="inline-flex items-center gap-1 bg-[#EDE9FE] text-[#5B21B6] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                  <FileText className="w-3 h-3" /> {supportCase.category}
                </span>
                <span
                  className={`border text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block uppercase tracking-wider ${getStatusBadgeColor(
                    supportCase.status,
                  )}`}
                >
                  {supportCase.status}
                </span>
                {supportCase.linkedAppId && (
                  <span className="inline-flex items-center gap-1 bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] px-2 py-0.5 rounded text-[10px] font-semibold">
                    <LinkIcon className="w-3 h-3" /> {supportCase.linkedAppId}
                  </span>
                )}
              </div>

              {/* Thread Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {supportCase.status !== "Resolved" &&
                  supportCase.status !== "Closed" &&
                  (userRole === "manager" || userRole === "admin") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateSupportCase(supportCase.id, {
                          status: "Resolved",
                        });
                      }}
                      className="h-7 text-[10px] px-2.5 gap-1 border-[#003769]/20 text-[#003769] hover:bg-blue-50 bg-blue-50/10 font-bold"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                    </Button>
                  )}

                {supportCase.status !== "Closed" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateSupportCase(supportCase.id, { status: "Closed" });
                    }}
                    className="h-7 text-[10px] px-2.5 gap-1 border-red-500/20 text-red-700 hover:bg-red-50 bg-red-50/10 font-bold"
                  >
                    <Lock className="w-3.5 h-3.5" /> Close Case
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div
            ref={scrollRef}
            className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 bg-[#F9FAFB] scroll-smooth"
          >
            {supportCase.messages.map((msg, index) => {
              // Hide internal notes if user is employee or manager
              if (msg.isInternal && userRole !== "admin") return null;

              const isExpanded =
                expandedMessages[msg.id] !== undefined
                  ? expandedMessages[msg.id]
                  : true;
              const initials = msg.senderName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();
              const avatarColor = getAvatarColorClass(msg.senderRole);

              return (
                <div
                  key={msg.id}
                  className="bg-white border border-border rounded-lg overflow-hidden transition-shadow duration-150 hover:shadow-sm"
                >
                  {/* Message Header (Clickable to toggle expand/collapse) */}
                  <div
                    onClick={() => toggleMessage(msg.id)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer select-none hover:bg-muted/10 bg-white"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 ${avatarColor}`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Top row: name + badges */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold text-sm text-[#0D2B4E] leading-none">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded font-semibold capitalize">
                          {msg.senderRole}
                        </span>
                        {msg.isInternal && (
                          <Badge className="bg-amber-100 border-amber-200 text-amber-800 text-[8px] h-4 rounded font-bold uppercase tracking-wider gap-0.5">
                            <Lock className="w-2 h-2" /> Internal Note
                          </Badge>
                        )}
                      </div>
                      {/* Bottom row: date + chevron */}
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(msg.timestamp)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message Body */}
                  {isExpanded && (
                    <>
                      <div className="pl-3 sm:pl-14 pr-4 py-4 text-xs leading-relaxed text-slate-800 border-t border-border/60 whitespace-pre-wrap font-body">
                        {msg.message}

                        {/* Message Attachment */}
                        {msg.attachment && (
                          <div className="flex items-center gap-2 bg-[#F9FAFB] border border-border rounded-md px-3 py-2 text-xs text-[#0D2B4E] mt-3 max-w-xs">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold block truncate">
                                {msg.attachment.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground block">
                                {msg.attachment.size}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pl-3 sm:pl-14 pr-4 pb-3 pt-1 flex flex-wrap gap-2 border-t border-border/40 bg-muted/5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReplyText(`Replying to ${msg.senderName}:\n\n`);
                          }}
                          className="px-3 py-1.5 border border-border bg-white text-muted-foreground hover:text-[#003769] hover:border-[#003769] rounded text-[10px] font-semibold flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Reply
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Employee Reopen Alert inline */}
          {userRole === "employee" && supportCase.status === "Resolved" && (
            <div className="mx-6 my-4 p-4 bg-blue-50 border border-blue-100 text-blue-950 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-body">
              <div>
                <p className="font-bold">
                  This support case has been marked as Resolved.
                </p>
                <p className="text-muted-foreground mt-0.5">
                  If the issue is still unresolved, you may re-open it to
                  continue the discussion.
                </p>
              </div>
              <Button
                onClick={handleReopen}
                size="sm"
                className="h-8 bg-[#003769] hover:bg-[#003769]/90 text-white font-semibold rounded-md shadow-sm shrink-0 border-none"
              >
                Re-open Case
              </Button>
            </div>
          )}

          {/* Reply Box Card */}
          <footer className="p-1.5 border-t border-border bg-card shrink-0">
            {supportCase.status === "Closed" ? (
              <div className="text-center py-2 text-xs text-muted-foreground font-semibold flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5" /> This support ticket has been
                closed. Replies are disabled.
              </div>
            ) : (
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1 border-b border-border bg-muted/10">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${getAvatarColorClass(currentUser.role)}`}
                    >
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-[#0D2B4E]">
                      Reply from {currentUser.name}
                    </span>
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-[10px] font-medium">
                      To:{" "}
                      {userRole === "admin"
                        ? "Employee"
                        : "Benefits Specialist"}
                    </span>
                  </div>
                </div>

                <textarea
                  rows={1}
                  placeholder={
                    userRole === "admin"
                      ? "Type a response to the employee or add an internal note..."
                      : "Type a comment or question..."
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border-0 focus:ring-0 focus:outline-none px-3 py-2 text-xs resize-none min-h-[40px] leading-relaxed font-body"
                />

                <div className="flex items-center gap-1.5 px-3 py-1 border-t border-border bg-muted/5">
                  {/* Send buttons — left side, always visible */}
                  <div className="flex gap-1.5">
                    {userRole === "admin" && (
                      <Button
                        type="button"
                        onClick={() => handleSendMessage(true)}
                        disabled={!replyText.trim()}
                        variant="outline"
                        className="h-7 text-[10px] font-semibold border-amber-500/30 text-amber-700 hover:bg-amber-500/5 gap-1 rounded-md px-2.5"
                      >
                        <Lock className="w-3 h-3 text-amber-600" /> Internal
                        Note
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => handleSendMessage(false)}
                      disabled={!replyText.trim()}
                      className="h-7 text-[10px] font-semibold bg-[#003769] hover:bg-[#003769]/90 text-white border-none px-3 gap-1 rounded-md"
                    >
                      <Send className="w-3 h-3" />
                      {userRole === "admin" ? "Send to Employee" : "Send Reply"}
                    </Button>
                  </div>

                  {/* Format buttons — inline after send */}
                  <div className="flex items-center gap-1 ml-3 pl-3 border-l border-border/60">
                    <button
                      type="button"
                      title="Attach file"
                      onClick={() =>
                        alert(
                          "File attachment feature is for demonstration only.",
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center rounded bg-[#003769] text-white hover:bg-[#003769]/80 transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Bold"
                      className="w-7 h-7 flex items-center justify-center rounded bg-[#003769] text-white hover:bg-[#003769]/80 transition-colors"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      className="w-7 h-7 flex items-center justify-center rounded bg-[#003769] text-white hover:bg-[#003769]/80 transition-colors"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </footer>
        </main>

        {/* Right Sidebar - Manager/Admin Only */}
        {(userRole === "manager" || userRole === "admin") && (
          <aside className="w-full lg:w-[280px] bg-card border-t lg:border-t-0 lg:border-l border-border p-5 flex flex-col gap-5 overflow-y-auto shrink-0 bg-white">
            {/* Case Details Card */}
            <div className="space-y-3 bg-[#F9FAFB] border border-border rounded-lg p-4">
              <h3 className="text-xs font-bold text-[#0D2B4E] border-b border-border pb-1.5 uppercase tracking-wide">
                Case Details
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`border text-[9px] font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider ${getStatusBadgeColor(supportCase.status)}`}
                  >
                    {supportCase.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <span className="font-semibold text-foreground">
                    {supportCase.priority || "Medium"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold text-foreground">
                    {supportCase.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-semibold text-foreground">
                    {formatDate(supportCase.createdDate).split(",")[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Linked App</span>
                  <span className="font-mono font-semibold text-foreground">
                    {supportCase.linkedAppId || "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned to</span>
                  <span className="font-semibold text-foreground">
                    {supportCase.assignedTo || "Unassigned"}
                  </span>
                </div>
              </div>

              {/* Quick Actions inside Case Details */}
              {supportCase.status !== "Closed" && (
                <div className="flex flex-col gap-2 pt-2 border-t border-border mt-3">
                  {supportCase.status !== "Resolved" && (
                    <Button
                      onClick={() =>
                        updateSupportCase(supportCase.id, {
                          status: "Resolved",
                        })
                      }
                      size="sm"
                      className="w-full h-8 text-[10px] font-semibold bg-[#003769] hover:bg-[#003769]/90 text-white border-none rounded-md"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Mark Resolved
                    </Button>
                  )}
                  {userRole === "manager" && (
                    <Button
                      onClick={handleEscalate}
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-[10px] font-semibold border-amber-500/30 text-amber-700 hover:bg-amber-50/5 rounded-md"
                    >
                      <ShieldAlert className="w-3 h-3 mr-1" /> Escalate
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Employee Profile Card */}
            {(() => {
              const emp =
                mockEmployees.find(
                  (e) =>
                    e.employeeId === supportCase.employeeId ||
                    e.name === supportCase.employeeName,
                ) || mockEmployees[0];
              const initials = emp.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();
              const tenureYears = emp.hireDate
                ? Math.max(1, 2026 - new Date(emp.hireDate).getFullYear())
                : 4;

              return (
                <div className="space-y-3 bg-[#F9FAFB] border border-border rounded-lg p-4">
                  <h3 className="text-xs font-bold text-[#0D2B4E] border-b border-border pb-1.5 uppercase tracking-wide">
                    Employee Profile
                  </h3>
                  <div className="flex items-center gap-2.5 pb-1">
                    <div className="w-8 h-8 rounded-full bg-[#003769] flex items-center justify-center text-xs font-bold text-white uppercase">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0D2B4E] truncate">
                        {emp.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {emp.title}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs border-t border-border/60 pt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employee ID</span>
                      <span className="font-semibold text-foreground">
                        {emp.employeeId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-semibold text-foreground text-right">
                        {emp.department.split("—")[0].trim()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tenure</span>
                      <span className="font-semibold text-foreground">
                        {tenureYears} years
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Union</span>
                      <span className="font-semibold text-foreground">
                        {emp.isNYSNA ? "NYSNA" : "Non-Union"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Linked Application details card */}
            {(() => {
              if (!supportCase.linkedAppId) return null;
              const app = mockApplications.find(
                (a) =>
                  a.id === supportCase.linkedAppId ||
                  a.trackingId === supportCase.linkedAppId,
              );
              return (
                <div className="space-y-3 bg-[#F9FAFB] border border-border rounded-lg p-4">
                  <h3 className="text-xs font-bold text-[#0D2B4E] border-b border-border pb-1.5 uppercase tracking-wide">
                    Linked Application
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Request ID</span>
                      <span className="font-mono font-semibold text-foreground">
                        {supportCase.linkedAppId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Program</span>
                      <span className="font-semibold text-foreground">
                        {supportCase.linkedAppProgram?.replace(
                          "Reimbursement",
                          "",
                        ) || "Regular Tuition"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold text-foreground">
                        $3,200
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">App Status</span>
                      <span className="font-semibold text-[#008573] uppercase text-[9px] font-bold">
                        {supportCase.linkedAppStatus || "Under Review"}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      router.push(`/applications/${supportCase.linkedAppId}`)
                    }
                    variant="outline"
                    size="sm"
                    className="w-full h-8 mt-2 text-[10px] font-semibold border-border hover:bg-muted/10 gap-1 rounded-md"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> View Application
                  </Button>
                </div>
              );
            })()}
          </aside>
        )}
      </div>
    </Layout>
  );
}
