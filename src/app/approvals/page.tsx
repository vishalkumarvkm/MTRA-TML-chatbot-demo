"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockApprovalItems } from "@/data/mockData";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  User,
  Zap,
  AlertTriangle,
  Clock,
  DollarSign,
  XCircle,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";

interface ActionStatus {
  itemId: string;
  action: "approved" | "rejected";
  message: string;
}

export default function ApprovalsPage() {
  // We initialize approvals with the first item having a future due date for active testing,
  // while others remain past-due to test auto-suspension.
  const [approvals, setApprovals] = useState(() => {
    return mockApprovalItems.map((item, idx) => {
      if (idx === 0) {
        return {
          ...item,
          dueDate: "2026-07-15", // Future due date
        };
      }
      return item;
    });
  });

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [actionStatuses, setActionStatuses] = useState<Record<string, ActionStatus>>({});

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const formatDate = (ts: string | number) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleApprove = (id: string, name: string, amount: number) => {
    setActionStatuses((prev) => ({
      ...prev,
      [id]: {
        itemId: id,
        action: "approved",
        message: `✅ Approved: Reimbursement request of ${formatCurrency(amount)} for ${name} has been approved and forwarded to HR Benefits for payroll processing.`,
      },
    }));
  };

  const handleReject = (id: string, name: string) => {
    setActionStatuses((prev) => ({
      ...prev,
      [id]: {
        itemId: id,
        action: "rejected",
        message: `❌ Rejected: Reimbursement request for ${name} has been rejected and returned to the associate for correction.`,
      },
    }));
  };

  const getSystemDate = () => new Date("2026-06-26");

  const isCaseSuspended = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const systemDate = getSystemDate();
    return due < systemDate;
  };

  return (
    <Layout
      title="Pending Approvals"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Approvals" },
      ]}
    >
      <div className="p-4 space-y-4 max-w-5xl mx-auto bg-muted/10 min-h-full" data-ocid="approvals.page">
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">
            Manager Approvals
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Review and approve reimbursement requests for your direct clinical reports and department associates.
          </p>
        </div>

        <div className="grid gap-4">
          {approvals.length === 0 ? (
            <Card className="border-border shadow-sm p-12 text-center text-muted-foreground">
              No pending approvals.
            </Card>
          ) : (
            approvals.map((approval, idx) => {
              const isExpanded = !!expandedItems[approval.id];
              const actionResult = actionStatuses[approval.id];
              const isSuspended = isCaseSuspended(approval.dueDate);

              return (
                <Card
                  key={approval.id}
                  className={`border-border shadow-sm hover:shadow-md transition-all group overflow-hidden ${
                    isSuspended ? "bg-card/90" : "bg-card"
                  }`}
                  data-ocid={`approvals.item.${idx + 1}`}
                >
                  <CardContent className="p-0 flex flex-col">
                    {/* Top Row: Basic Info */}
                    <div className="py-3 px-4 flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-foreground">
                                {approval.employeeName}
                              </h3>
                              <p className="text-[10px] text-muted-foreground">
                                Employee ID: {approval.employeeId} • {approval.employeeTitle}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold border-primary/20 text-primary bg-primary/5 h-5 px-2">
                            {approval.programType.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">
                              Amount Requested
                            </p>
                            <p className="text-base font-bold text-foreground flex items-center gap-0.5">
                              <DollarSign className="w-3.5 h-3.5 text-primary" />
                              {formatCurrency(approval.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">
                              Submission Date
                            </p>
                            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {formatDate(approval.submittedDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">
                              Due Date
                            </p>
                            <p className={`text-xs font-semibold flex items-center gap-1 ${
                              isSuspended ? "text-destructive font-bold" : "text-amber-600"
                            }`}>
                              <Clock className="w-3 h-3" />
                              {formatDate(approval.dueDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">
                              Approval Status
                            </p>
                            {isSuspended ? (
                              <Badge className="bg-amber-100 text-amber-800 border-transparent text-[8px] font-bold h-4 px-1 font-body">
                                Escalated (Past Due)
                              </Badge>
                            ) : actionResult ? (
                              <Badge className={`text-[8px] font-bold h-4 px-1 ${
                                actionResult.action === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                              }`}>
                                {actionResult.action.toUpperCase()}
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-transparent text-[8px] font-bold h-4 px-1">
                                Pending Manager
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Escalation Warning Alert */}
                        {isSuspended && (
                          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-amber-600">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide font-body">Escalated to Next Approver</p>
                              <p className="text-[10px] text-amber-700 leading-relaxed mt-0.5 font-body">
                                This request reached its due date ({formatDate(approval.dueDate)}) without a manager decision and was auto-escalated to the next approver. Actions are read-only.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Interactive Action Feedbacks */}
                        {actionResult && (
                          <div className={`mt-4 p-3 rounded-xl border flex items-start gap-2 text-xs font-medium leading-relaxed ${
                            actionResult.action === "approved"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900"
                              : "bg-red-50 text-red-800 border-red-100 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900"
                          }`}>
                            {actionResult.action === "approved" ? (
                              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            )}
                            <span>{actionResult.message}</span>
                          </div>
                        )}
                      </div>

                      {/* Right actions sidebar (Approve, Reject, View Details) */}
                      <div className="border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4 flex flex-col justify-center gap-2 w-full md:w-48 flex-shrink-0">
                        <Button
                          onClick={() => handleApprove(approval.id, approval.employeeName, approval.amount)}
                          disabled={isSuspended || !!actionResult}
                          className="w-full h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs font-bold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReject(approval.id, approval.employeeName)}
                          disabled={isSuspended || !!actionResult}
                          className="w-full h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 text-xs font-bold"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-8 gap-1 text-[11px] text-muted-foreground hover:text-foreground font-bold"
                          onClick={() => toggleExpand(approval.id)}
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                          {isExpanded ? <ChevronDown className="w-3 h-3 rotate-180 transition-transform" /> : <ChevronRight className="w-3 h-3 transition-transform" />}
                        </Button>
                      </div>
                    </div>

                    {/* Detailed Section (Do not show by default; only show when expanded) */}
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-3 border-t border-border bg-muted/10 space-y-3 animate-in fade-in duration-200">
                        {/* Course & Application Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <h4 className="text-[9px] font-bold text-muted-foreground uppercase">Institution</h4>
                            <p className="text-xs font-bold text-foreground">{approval.institution}</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-[9px] font-bold text-muted-foreground uppercase">Course Title</h4>
                            <p className="text-xs font-bold text-foreground">{approval.courseTitle}</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-[9px] font-bold text-muted-foreground uppercase">Credits / Type</h4>
                            <p className="text-xs font-bold text-foreground">{approval.credits > 0 ? `${approval.credits} Credits` : "CME Seminar"}</p>
                          </div>
                        </div>

                        {/* AI Summary details */}
                        <div className="py-2.5 px-3 rounded-lg bg-primary/5 border border-primary/10 space-y-1">
                          <div className="flex items-center gap-1.5 text-primary">
                            <Brain className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">AI Policy Analysis Summary</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed italic">
                            "{approval.aiSummary}"
                          </p>
                        </div>

                        {/* Approver Routing path & authority validation */}
                        <div className="space-y-2">
                          <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Approver Routing Verification
                          </h4>
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 p-2.5 rounded-lg border border-border bg-card text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="font-semibold">Internal Medicine Nursing Dept</span>
                            </div>
                            <ArrowRight className="hidden md:block w-3.5 h-3.5 text-muted-foreground/60" />
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Clinical Approver: <strong className="font-bold">Dr. James Okonkwo</strong></span>
                            </div>
                            <Badge className="ml-auto bg-emerald-50 text-emerald-700 border-transparent text-[8px] font-bold h-4">
                              Routing Path Verified
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed pl-1">
                            Note: Approvals for nursing degree courses (NUR 604) automatically route to designated Nurse Managers with clinical tuition program validation authority.
                          </p>
                        </div>

                        {/* History Log / Audit Trail */}
                        <div className="space-y-2 border-t border-border pt-2">
                          <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Application Audit History</h4>
                          <div className="relative pl-4 space-y-3.5 border-l border-border/80 ml-2 pt-2">
                            <div className="relative">
                              <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-card shadow-sm" />
                              <p className="text-[10px] font-bold text-foreground leading-none">Application Submitted</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">Submitted by associate {approval.employeeName} • {formatDate(approval.submittedDate)}</p>
                            </div>
                            <div className="relative">
                              <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-card shadow-sm" />
                              <p className="text-[10px] font-bold text-foreground leading-none">AI Eligibility Check Completed</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">AI extraction checked. 94% documentation verification confidence • {formatDate(approval.submittedDate)}</p>
                            </div>
                            <div className="relative">
                              <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-card shadow-sm" />
                              <p className="text-[10px] font-bold text-foreground leading-none">Awaiting Manager Approval</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">Routed to designated Nurse Manager Dr. James Okonkwo • {formatDate(approval.submittedDate)}</p>
                            </div>
                            {actionResult && (
                              <div className="relative">
                                <span className={`absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full border border-card shadow-sm ${
                                  actionResult.action === "approved" ? "bg-emerald-500" : "bg-red-500"
                                }`} />
                                <p className="text-[10px] font-bold text-foreground leading-none">
                                  {actionResult.action === "approved" ? "Approved by Manager" : "Rejected by Manager"}
                                </p>
                                <p className="text-[9px] text-muted-foreground mt-0.5">Decision completed on {new Date().toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
