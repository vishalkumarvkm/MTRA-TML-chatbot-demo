"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockNotifications, mockEmployees } from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import {
  Bell,
  CheckCircle2,
  Clock,
  Search,
  AlertTriangle,
  BookOpen,
  Info,
  ChevronRight,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Paperclip,
  History,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const NOTIF_ICONS: Record<string, any> = {
  approval: { icon: CheckCircle2, color: "text-emerald-500 border-emerald-200", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" },
  deadline: { icon: AlertTriangle, color: "text-amber-500 border-amber-200", bg: "bg-amber-500/10 dark:bg-amber-500/20" },
  status_change: { icon: Clock, color: "text-primary border-primary/20", bg: "bg-primary/10 dark:bg-primary/20" },
  sla: { icon: AlertTriangle, color: "text-destructive border-destructive/20", bg: "bg-destructive/10 dark:bg-destructive/20" },
  document: { icon: BookOpen, color: "text-blue-500 border-blue-200", bg: "bg-blue-500/10 dark:bg-blue-500/20" },
  system: { icon: Info, color: "text-muted-foreground border-border", bg: "bg-muted" },
};

interface Message {
  id: string;
  senderName: string;
  senderRole: "employee" | "admin" | "system";
  message: string;
  timestamp: string;
}

interface Thread {
  id: string;
  subject: string;
  relatedAppId?: string;
  messages: Message[];
  unread: boolean;
}

export default function NotificationCenter() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<"status" | "messages">("status");
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");

  const employee = mockEmployees.find((e) => e.employeeId === currentUser?.employeeId) ?? mockEmployees[0];

  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "thread-001",
      subject: "Query on Application MTRA-2026-0041 (Fordham University)",
      relatedAppId: "app-001",
      unread: true,
      messages: [
        {
          id: "m1",
          senderName: "System",
          senderRole: "system",
          message: "Application MTRA-2026-0041 for Fordham University has been successfully submitted and is under review.",
          timestamp: "2026-04-15T09:00:00Z",
        },
        {
          id: "m2",
          senderName: "System Admin",
          senderRole: "admin",
          message: "Hi Maria, I am reviewing your tuition reimbursement request for Fordham. I noticed the uploaded transcript does not clearly indicate your enrollment status (full-time vs part-time) or the grading scale. Could you please clarify or upload the supplementary page?",
          timestamp: "2026-04-16T14:30:00Z",
        },
        {
          id: "m3",
          senderName: "Maria Santos",
          senderRole: "employee",
          message: "Hi Admin, I'm registered for 6 credits this semester, which is part-time for my program. I've just uploaded the syllabus and the official CUNY Lehman grading scale page to the document section. Please let me know if that works!",
          timestamp: "2026-04-17T10:15:00Z",
        },
        {
          id: "m4",
          senderName: "System Admin",
          senderRole: "admin",
          message: "Thanks, Maria! I see the grading scale document now. However, to finalize this, we also need the signed Service Agreement. Service agreements apply to all NYSNA nurses receiving tuition assistance. Please sign it so we can progress the application.",
          timestamp: "2026-04-20T08:00:00Z",
        }
      ]
    },
    {
      id: "thread-002",
      subject: "CME Conference Reimbursement (ANA Critical Care)",
      relatedAppId: "app-002",
      unread: false,
      messages: [
        {
          id: "t2-m1",
          senderName: "System",
          senderRole: "system",
          message: "CME reimbursement application MTRA-2026-0023 submitted.",
          timestamp: "2026-03-10T11:00:00Z",
        },
        {
          id: "t2-m2",
          senderName: "System",
          senderRole: "system",
          message: "Application Approved. CME Reimbursement of $750 approved by Dr. James Okonkwo.",
          timestamp: "2026-03-12T09:30:00Z",
        },
        {
          id: "t2-m3",
          senderName: "System Admin",
          senderRole: "admin",
          message: "Hi Maria, your CME conference reimbursement has been approved and processed. It will be posted on your next bi-weekly payroll deposit.",
          timestamp: "2026-03-12T10:00:00Z",
        }
      ]
    },
    {
      id: "thread-003",
      subject: "General Question regarding IRS Tax Limit",
      unread: false,
      messages: [
        {
          id: "t3-m1",
          senderName: "Maria Santos",
          senderRole: "employee",
          message: "Hi Benefits Team, I had a question about the IRS Section 127 limit. Since I am a NYSNA nurse and my credits are fully covered, will the reimbursement exceed $5,250 this year? If so, is the excess amount taxed as payroll income?",
          timestamp: "2026-04-29T11:12:00Z",
        },
        {
          id: "t3-m2",
          senderName: "Derek Chen",
          senderRole: "admin",
          message: "Hi Maria, yes. Under IRS Section 127, any employer-provided educational assistance exceeding $5,250 in a calendar year is considered taxable wages and is subject to standard withholding. Our payroll system automatically flags and calculates this once approvals cross the limit.",
          timestamp: "2026-04-30T10:00:00Z",
        }
      ]
    }
  ]);

  const filteredNotifs = mockNotifications.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.message.toLowerCase().includes(search.toLowerCase());
    const matchesUser = n.userId === employee.id || currentUser?.role === 'admin';
    return matchesSearch && matchesUser;
  });

  const filteredThreads = threads.filter((t) => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
                          t.messages.some(m => m.message.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(
    filteredNotifs.length > 0 ? filteredNotifs[0].id : null
  );
  
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    threads.length > 0 ? threads[0].id : null
  );

  const activeNotif = filteredNotifs.find(n => n.id === selectedNotifId) || filteredNotifs[0];
  const activeThread = threads.find(t => t.id === selectedThreadId) || threads[0];

  const handleSendMessage = () => {
    if (!replyText.trim() || !selectedThreadId) return;

    setThreads(prevThreads => 
      prevThreads.map(thread => {
        if (thread.id === selectedThreadId) {
          return {
            ...thread,
            messages: [
              ...thread.messages,
              {
                id: `new-${Date.now()}`,
                senderName: currentUser?.name || "Maria Santos",
                senderRole: "employee",
                message: replyText,
                timestamp: new Date().toISOString(),
              }
            ]
          };
        }
        return thread;
      })
    );
    setReplyText("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout
      title="Application Status"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Application Status" },
      ]}
    >
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto bg-muted/20 min-h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display text-foreground">Communication Hub</h1>
            <p className="text-xs text-muted-foreground mt-1">Audit trail and official communications regarding your tuition assistance applications</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" className="h-9 px-4 font-bold text-xs">
              Mark All Read
            </Button>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 text-primary hover:bg-primary/5">
              <History className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border">
          <button
            onClick={() => {
              setActiveTab("status");
              setSearch("");
            }}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "status"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Application Status Updates ({filteredNotifs.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("messages");
              setSearch("");
            }}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "messages"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Official Communication Threads ({filteredThreads.length})
          </button>
        </div>

        {/* Search / Filter Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === "status"
                ? "Search status alerts..."
                : "Search message threads..."
            }
            className="pl-9 h-10 bg-card text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Main Split Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column - List Pane */}
          <div className="lg:col-span-4 space-y-3 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
            {activeTab === "status" ? (
              filteredNotifs.length === 0 ? (
                <div className="p-8 text-center bg-card rounded-xl border border-border text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No status alerts found</p>
                </div>
              ) : (
                filteredNotifs.map((notif) => {
                  const typeInfo = NOTIF_ICONS[notif.type] || NOTIF_ICONS.system;
                  const NotifIcon = typeInfo.icon;
                  return (
                    <Card
                      key={notif.id}
                      onClick={() => setSelectedNotifId(notif.id)}
                      className={`cursor-pointer border transition-all hover:border-primary/30 ${
                        selectedNotifId === notif.id
                          ? "border-primary bg-primary/[0.02]"
                          : "border-border bg-card"
                      }`}
                    >
                      <CardContent className="p-4 flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.bg} ${typeInfo.color}`}>
                          <NotifIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className={`text-xs font-bold truncate ${notif.read ? "text-foreground" : "text-primary"}`}>
                              {notif.title}
                            </h3>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-muted-foreground/60 block mt-2">
                            {formatDate(notif.createdAt)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center bg-card rounded-xl border border-border text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No conversations found</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const lastMsg = thread.messages[thread.messages.length - 1];
                return (
                  <Card
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`cursor-pointer border transition-all hover:border-primary/30 ${
                      selectedThreadId === thread.id
                        ? "border-primary bg-primary/[0.02]"
                        : "border-border bg-card"
                    }`}
                  >
                    <CardContent className="p-4 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs font-bold text-foreground line-clamp-1">
                          {thread.subject}
                        </h3>
                        {thread.unread && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {lastMsg ? `${lastMsg.senderName}: ${lastMsg.message}` : "No messages yet"}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        {thread.relatedAppId && (
                          <Badge variant="outline" className="text-[8px] h-4 font-mono">
                            {thread.relatedAppId}
                          </Badge>
                        )}
                        <span className="text-[9px] text-muted-foreground/60">
                          {lastMsg ? formatDate(lastMsg.timestamp) : ""}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Right Column - Detail Pane */}
          <div className="lg:col-span-8">
            {activeTab === "status" ? (
              activeNotif ? (
                <Card className="border border-border bg-card shadow-sm h-full min-h-[450px] flex flex-col justify-between">
                  <div>
                    <CardHeader className="pb-3 border-b border-border flex flex-row justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <Badge variant="outline" className="text-[9px] font-bold tracking-wider uppercase bg-muted/40">
                          {activeNotif.type.replace("_", " ")}
                        </Badge>
                        <CardTitle className="text-sm font-bold text-foreground">
                          {activeNotif.title}
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">
                          Alert Logged: {new Date(activeNotif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="p-5 rounded-xl border border-primary/10 bg-primary/[0.01]">
                        <p className="text-xs text-foreground leading-relaxed">
                          {activeNotif.message}
                        </p>
                      </div>

                      {/* Delivery Details */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Communication Channels Sent
                        </h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="h-5 gap-1 text-[10px] text-muted-foreground font-medium">
                            <Mail className="w-3 h-3 text-primary" /> Email Notification (Delivered)
                          </Badge>
                          <Badge variant="outline" className="h-5 gap-1 text-[10px] text-muted-foreground font-medium">
                            <MessageSquare className="w-3 h-3 text-primary" /> In-App Portal Alert
                          </Badge>
                          {activeNotif.priority === "high" && (
                            <Badge variant="outline" className="h-5 gap-1 text-[10px] text-muted-foreground font-medium">
                              <Smartphone className="w-3 h-3 text-primary" /> SMS Alert (Delivered)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  
                  {activeNotif.actionUrl && (
                    <div className="p-4 bg-muted/20 border-t border-border flex justify-end">
                      <Link href={activeNotif.actionUrl} passHref>
                        <Button className="h-9 gap-1 text-xs font-bold shadow-sm">
                          Resolve & View Request <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="border border-border bg-card shadow-sm h-full min-h-[450px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-medium">Select a status update to view details</p>
                  </div>
                </Card>
              )
            ) : activeThread ? (
              <Card className="border border-border bg-card shadow-sm h-full min-h-[500px] flex flex-col justify-between">
                {/* Thread Header */}
                <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xs font-bold text-foreground truncate">{activeThread.subject}</h2>
                    {activeThread.relatedAppId && (
                      <span className="text-[10px] text-muted-foreground">Linked Application: {activeThread.relatedAppId}</span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase border-emerald-200 bg-emerald-50 text-emerald-700 h-5">
                    Connected
                  </Badge>
                </div>

                {/* Message Log */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[350px] min-h-[250px] bg-muted/5">
                  {activeThread.messages.map((msg) => {
                    const isEmployee = msg.senderRole === "employee";
                    const isSystem = msg.senderRole === "system";

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="bg-card border border-border rounded-full px-4 py-1 text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 shadow-sm">
                            <Info className="w-3.5 h-3.5 text-primary" />
                            {msg.message}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isEmployee ? "justify-end" : "justify-start"}`}
                      >
                        {!isEmployee && (
                          <Avatar className="w-7 h-7 border flex-shrink-0 mt-0.5">
                            <AvatarFallback className="text-[9px] font-bold bg-muted-foreground/10">
                              {getInitials(msg.senderName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`space-y-1 max-w-[70%]`}>
                          <div className={`flex items-center gap-1.5 ${isEmployee ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] font-bold text-foreground">
                              {isEmployee ? "You" : msg.senderName}
                            </span>
                            <span className="text-[8px] text-muted-foreground/60 font-medium">
                              {formatDate(msg.timestamp)}
                            </span>
                          </div>
                          <div
                            className={`rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                              isEmployee
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-card border border-border text-foreground rounded-tl-none"
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                        {isEmployee && (
                          <Avatar className="w-7 h-7 border flex-shrink-0 mt-0.5 bg-primary/10">
                            <AvatarFallback className="text-[9px] font-bold text-primary bg-primary/5">
                              {getInitials(msg.senderName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Composer */}
                <div className="p-3 border-t border-border bg-card">
                  <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-muted/20">
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <Input
                      placeholder="Type a message to Benefits Administrator..."
                      className="border-none bg-transparent h-8 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs flex-1 shadow-none"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-8 w-8 rounded-lg p-0 flex items-center justify-center flex-shrink-0"
                      onClick={handleSendMessage}
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2 font-display">
                    <button
                      onClick={() => setReplyText("I have uploaded the requested grading scale document. Please review.")}
                      className="text-[9px] bg-muted/40 hover:bg-muted text-muted-foreground px-2 py-1 rounded border border-border transition-colors font-medium"
                    >
                      "Uploaded transcript scale"
                    </button>
                    <button
                      onClick={() => setReplyText("I've successfully signed the service agreement via Docusign.")}
                      className="text-[9px] bg-muted/40 hover:bg-muted text-muted-foreground px-2 py-1 rounded border border-border transition-colors font-medium"
                    >
                      "Signed agreement"
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border border-border bg-card shadow-sm h-full min-h-[500px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-25" />
                  <p className="text-sm font-medium">Select a thread to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
