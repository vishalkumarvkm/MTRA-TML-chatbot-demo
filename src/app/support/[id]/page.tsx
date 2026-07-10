"use client";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";
import { mockAuthUsers } from "@/data/mockData";
import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  User,
  ShieldAlert,
  Send,
  MessageSquare,
  Lock,
  PlusCircle,
  CheckCircle,
} from "lucide-react";
import type { SupportCaseMessage } from "@/types";

const HR_SPECIALISTS = ["Priya Nair", "Derek Chen", "Sarah Kim"];

export default function SupportCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser, supportCases, updateSupportCase } = useAppStore();
  const [replyText, setReplyText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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
          <p className="text-sm font-bold text-destructive">Support Case not found.</p>
          <Button variant="outline" onClick={() => router.push("/support")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Support Cases
          </Button>
        </div>
      </Layout>
    );
  }

  const userRole = currentUser.role;

  // Find corresponding employee details in database
  const currentEmployee = mockAuthUsers.find((u) => u.employeeId === currentUser.employeeId) || currentUser;

  // Check if role is authorized to view
  const canView =
    userRole === "hr" ||
    userRole === "admin" ||
    (userRole === "employee" && (supportCase.employeeId === currentEmployee.id || supportCase.employeeId === currentUser.employeeId || supportCase.employeeId === "emp-001")) ||
    userRole === "manager"; // managers can view cases linked to reports

  if (!canView) {
    return (
      <Layout title="Access Denied">
        <div className="p-12 text-center space-y-4 font-body">
          <p className="text-sm font-bold text-destructive">You are not authorized to view this support case.</p>
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
      senderRole: userRole as "employee" | "manager" | "hr" | "system",
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
      message: "[Escalation Alert] Unit Manager has flagged this ticket as 'Unable to Resolve' and escalated it to HR Specialists for policy exception review.",
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
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
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
      <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-muted/10 font-body">
        {/* Left Sidebar Info Column */}
        <aside className="w-full lg:w-[320px] bg-card border-b lg:border-b-0 lg:border-r border-border p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/support")}
              className="h-8 -ml-2 text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to list
            </Button>
          </div>

          {/* Ticket Information */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Ticket Information
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Case ID</span>
                <span className="font-mono font-bold text-foreground text-sm">{supportCase.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Subject</span>
                <span className="font-semibold text-foreground">{supportCase.subject}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Category</span>
                <span className="font-semibold text-foreground">{supportCase.category}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Status</span>
                <span
                  className={`border text-[9px] font-bold px-2 py-0.5 mt-1 rounded-full inline-block uppercase tracking-wider ${getStatusBadgeColor(
                    supportCase.status
                  )}`}
                >
                  {supportCase.status}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Created</span>
                <span className="font-medium text-foreground">{formatDate(supportCase.createdDate)}</span>
              </div>
              {supportCase.reopenedFlag && (
                <div>
                  <span className="text-muted-foreground block">Re-opened Date</span>
                  <span className="font-medium text-destructive">{formatDate(supportCase.reopenedDate)}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground block">Assigned HR Specialist</span>
                {userRole === "hr" || userRole === "admin" ? (
                  <Select
                    value={supportCase.assignedTo}
                    onValueChange={(val: string) => updateSupportCase(supportCase.id, { assignedTo: val })}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1 bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HR_SPECIALISTS.map((hr) => (
                        <SelectItem key={hr} value={hr} className="text-xs">
                          {hr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-1">
                    <User className="w-3 h-3 text-muted-foreground" /> {supportCase.assignedTo || "Unassigned"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* HR-Specific Status Controls */}
          {(userRole === "hr" || userRole === "admin") && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Resolution Controls
              </h3>
              <div className="space-y-2">
                <Label htmlFor="statusSelect" className="text-[10px] text-muted-foreground">
                  Update Case Status
                </Label>
                <Select
                  value={supportCase.status}
                  onValueChange={(val: string) =>
                    updateSupportCase(supportCase.id, {
                      status: val as "Open" | "In Progress" | "Resolved" | "Closed",
                    })
                  }
                >
                  <SelectTrigger id="statusSelect" className="h-8 text-xs bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Open", "In Progress", "Resolved", "Closed"].map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="resNotes" className="text-[10px] text-muted-foreground">
                  Resolution Notes (Internal Only)
                </Label>
                <textarea
                  id="resNotes"
                  rows={3}
                  value={supportCase.resolutionNotes || ""}
                  onChange={(e) => updateSupportCase(supportCase.id, { resolutionNotes: e.target.value })}
                  placeholder="Enter ticket resolution detail notes..."
                  className="w-full rounded-md border border-input bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-body"
                />
              </div>
            </div>
          )}

          {/* Employee Reopen Panel */}
          {userRole === "employee" && supportCase.status === "Resolved" && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 rounded-lg text-xs space-y-2">
              <p className="font-semibold leading-relaxed">
                This case has been resolved. If you still need help, you can re-open it within 5 business days.
              </p>
              <Button
                onClick={handleReopen}
                size="sm"
                className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md"
              >
                Re-open Case
              </Button>
            </div>
          )}

          {/* Linked Application Summary */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Linked Application
            </h3>
            {supportCase.linkedAppId ? (
              <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs space-y-2">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Request ID</span>
                  <span className="font-mono font-semibold">{supportCase.linkedAppId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Program</span>
                  <span className="font-semibold text-slate-700">
                    {supportCase.linkedAppProgram?.replace("Reimbursement", "")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Submitted</span>
                  <span className="font-medium">{formatDate(supportCase.linkedAppDate).split(",")[0]}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">App Status</span>
                  <span className="font-semibold text-[#008573]">{supportCase.linkedAppStatus || "UnderReview"}</span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">None linked. General support query.</span>
            )}
          </div>
        </aside>

        {/* Right Main Conversational Thread Area */}
        <main className="flex-grow flex flex-col min-w-0 h-full overflow-hidden bg-card">
          {/* Header Row */}
          <header className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#008573]/10 flex items-center justify-center text-[#008573]">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Conversation Thread</h2>
                <p className="text-[10px] text-muted-foreground">
                  Support ticket discussions with Benefits HR Specialist
                </p>
              </div>
            </div>
          </header>

          {/* Messages list */}
          <div
            ref={scrollRef}
            className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/5 scroll-smooth"
          >
            {supportCase.messages.map((msg) => {
              // Hide internal notes if user is employee or manager
              if (msg.isInternal && userRole !== "hr" && userRole !== "admin") return null;

              const isUser = msg.senderName === currentUser.name;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-full`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-semibold text-muted-foreground">
                    <span>{msg.senderName}</span>
                    <span>•</span>
                    <span className="uppercase text-[8px] bg-muted px-1.5 py-0.2 rounded font-bold">
                      {msg.senderRole}
                    </span>
                    {msg.isInternal && (
                      <Badge className="bg-amber-100 border-amber-200 text-amber-800 text-[8px] h-4 rounded font-bold uppercase tracking-wider gap-0.5">
                        <Lock className="w-2 h-2" /> Internal Note
                      </Badge>
                    )}
                  </div>
                  <div
                    className={`p-3.5 rounded-xl border text-xs max-w-md leading-relaxed whitespace-pre-wrap ${
                      msg.isInternal
                        ? "bg-amber-500/5 border-amber-500/20 text-slate-800"
                        : isUser
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-card text-foreground border-border"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[8px] text-muted-foreground mt-1 px-1">
                    {formatDate(msg.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Form input controls */}
          <footer className="p-4 border-t border-border bg-card shrink-0">
            {supportCase.status === "Closed" ? (
              <div className="text-center py-2 text-xs text-muted-foreground font-semibold">
                This support ticket has been closed. Replies are disabled.
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={2}
                  placeholder={
                    userRole === "hr"
                      ? "Type a response to the employee or add an internal note..."
                      : "Type a comment or question..."
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {userRole === "manager" && supportCase.status !== "Resolved" && (
                      <Button
                        type="button"
                        onClick={handleEscalate}
                        variant="outline"
                        className="h-8 text-[10px] font-semibold border-amber-500/30 text-amber-700 hover:bg-amber-500/5 gap-1.5 rounded-md"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Mark as Unable to Resolve — Escalate to HR
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2 ml-auto">
                    {userRole === "hr" && (
                      <Button
                        type="button"
                        onClick={() => handleSendMessage(true)}
                        disabled={!replyText.trim()}
                        variant="outline"
                        className="h-8 text-[10px] font-semibold border-amber-500/30 text-amber-700 hover:bg-amber-500/5 gap-1.5 rounded-md"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-600" /> Save Internal Note
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => handleSendMessage(false)}
                      disabled={!replyText.trim()}
                      className="h-8 text-[10px] font-semibold px-4 bg-[#008573] hover:bg-[#006e5f] text-white gap-1.5 rounded-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {userRole === "hr" ? "Send to Employee" : "Send Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </footer>
        </main>
      </div>
    </Layout>
  );
}
