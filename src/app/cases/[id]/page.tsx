"use client";
// Forced rebuild to resolve icon reference errors

import { Layout } from "@/components/layout/Layout";
import { AIConfidenceBadge } from "@/components/ui/AIConfidenceBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCaseItems, mockEmployees } from "@/data/mockData";
import type { AuditEntry, UserRole } from "@/types";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileSignature,
  FileText,
  History,
  Info,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

const CHECKLIST_ITEMS = [
  {
    id: "submissionPath",
    label: "ServiceNow Path Valid",
    desc: "Submitted through 'Apply for Tuition Reimbursement or Scholarship Programs'",
  },
  {
    id: "correctProgram",
    label: "Correct Program Type",
    desc: "Matches programType to required documents",
  },
  {
    id: "completedApplication",
    label: "Application Completed",
    desc: "No blank required fields (EZID, semester, campus, etc.)",
  },
  {
    id: "allSignatures",
    label: "Required Signatures Present",
    desc: "Manager/employee signatures validated",
  },
  {
    id: "billQuality",
    label: "Itemized School Bill Attached",
    desc: "Excludes late fees, payment plans, books",
  },
  {
    id: "gradesQuality",
    label: "Grades Verified (C or better)",
    desc: "Student name visible, no 'Enrolled' or 'In Progress' states",
  },
  {
    id: "serviceAgreement",
    label: "Service Agreement Notarized",
    desc: "Required if NYSNA RN or amount > $3,000",
  },
  {
    id: "cmeSignatures",
    label: "CME Specific Approvers Met",
    desc: "PT (Asst Chief) or PA (Dept Admin) signoff",
  },
  {
    id: "acceptanceLetter",
    label: "Freshman Acceptance Letter",
    desc: "Children's Tuition program only",
  },
  {
    id: "scholarshipDeadline",
    label: "Scholarship Deadline Met",
    desc: "Submitted by July 1 with school seal + FAO signature",
  },
  {
    id: "documentQuality",
    label: "Documents Legible PDF",
    desc: "All docs in single, clear PDF; no hyperlinks",
  },
  {
    id: "noDuplicates",
    label: "No Duplicate Applications",
    desc: "No duplicate open tickets for same semester/course",
  },
  {
    id: "notCertification",
    label: "Not Certification Course",
    desc: "Excluded certification types (ACLS, BLS, PALS)",
  },
  {
    id: "withinTimeWindow",
    label: "Submission Within Window",
    desc: "45 days from course start / 90 days from course completion",
  },
];

export default function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Find case data
  const caseData = mockCaseItems.find((c) => c.id === id) || mockCaseItems[0];
  const employee =
    mockEmployees.find((e) => e.id === caseData.employeeId) || mockEmployees[0];

  // ----------------------------------------------------
  // INTERACTIVE WORKFLOW STATES (SOP COMPLIANCE)
  // ----------------------------------------------------
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4 | 5>(() => {
    if (caseData.status === "Approved") return 5;
    if (caseData.status === "PendingApproval") return 3;
    if (caseData.status === "UnderReview") return 2;
    return 1;
  });

  const [tier1Status, setTier1Status] = useState<
    "approved" | "incomplete" | "flagged" | "escalated"
  >(() => {
    if (id === "case-001") return "incomplete";
    if (caseData.status === "Approved") return "approved";
    if (caseData.status === "Escalated") return "escalated";
    return "approved";
  });

  const [hwStatus, setHwStatus] = useState<
    "pending" | "under-review" | "pending-info" | "approved" | "rejected"
  >(() => {
    if (id === "case-001") return "pending";
    if (caseData.status === "Approved") return "approved";
    if (caseData.status === "UnderReview") return "under-review";
    return "pending";
  });

  const [payrollStatus, setPayrollStatus] = useState<
    "awaiting" | "processing" | "processed"
  >(() => {
    if (caseData.status === "Approved") return "processed";
    return "awaiting";
  });

  const [paymentStatus, setPaymentStatus] = useState<"scheduled" | "paid">(
    () => {
      if (caseData.status === "Approved") return "paid";
      return "scheduled";
    },
  );

  // 14-Point Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    if (id === "case-001") {
      return {
        submissionPath: true,
        correctProgram: true,
        completedApplication: true,
        allSignatures: false, // pending manager signature
        billQuality: true,
        gradesQuality: true,
        serviceAgreement: false, // NYSNA tuition needs SA
        cmeSignatures: true,
        acceptanceLetter: true,
        scholarshipDeadline: true,
        documentQuality: true,
        noDuplicates: true,
        notCertification: true,
        withinTimeWindow: true,
      };
    }
    return {
      submissionPath: true,
      correctProgram: true,
      completedApplication: true,
      allSignatures: true,
      billQuality: true,
      gradesQuality: true,
      serviceAgreement: true,
      cmeSignatures: true,
      acceptanceLetter: true,
      scholarshipDeadline: true,
      documentQuality: true,
      noDuplicates: true,
      notCertification: true,
      withinTimeWindow: true,
    };
  });

  // 3-Part Signature States
  const [signatures, setSignatures] = useState(() => {
    return {
      employee: {
        role: "Employee",
        name: employee.name,
        date: "04/15/2026",
        status: "complete" as const,
        order: 1,
      },
      admin: {
        role: "Administrator",
        name: id === "case-001" ? "" : "System Admin",
        date: id === "case-001" ? "" : "04/22/2026",
        status:
          id === "case-001" ? ("pending" as const) : ("complete" as const),
        order: 2,
      },
      deptHead: {
        role: "Department Head",
        name: id === "case-001" ? "" : "Dr. James Okonkwo",
        date: id === "case-001" ? "" : "04/25/2026",
        status:
          id === "case-001" ? ("pending" as const) : ("complete" as const),
        order: 3,
      },
    };
  });

  // Signature Input Fields
  const [adminNameInput, setAdminNameInput] = useState("");
  const [adminSigChecked, setAdminSigChecked] = useState(false);
  const [adminDateInput, setAdminDateInput] = useState("");

  const [deptHeadNameInput, setDeptHeadNameInput] = useState("");
  const [deptHeadSigChecked, setDeptHeadSigChecked] = useState(false);
  const [deptHeadDateInput, setDeptHeadDateInput] = useState("");

  // Live Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => {
    return [
      {
        id: "a-1",
        timestamp: "2026-04-15 10:23 am",
        action: "APPLICATION_SUBMITTED",
        actor: employee.name,
        actorRole: "employee",
        entityId: caseData.applicationId,
        entityType: "application",
        description:
          "Application submitted for Tuition Reimbursement via ServiceNow portal.",
      },
      {
        id: "a-2",
        timestamp: "2026-04-15 10:25 am",
        action: "AI_ELIGIBILITY_CHECK",
        actor: "HealthyME AI Agent",
        actorRole: "admin",
        entityId: caseData.applicationId,
        entityType: "system",
        description:
          "AI extraction completed. Confidence score: 94%. Checked department rules.",
      },
      {
        id: "a-3",
        timestamp: "2026-04-16 09:15 am",
        action: "TIER1_REVIEW_STARTED",
        actor: "System Admin",
        actorRole: "admin",
        entityId: caseData.id,
        entityType: "case",
        description: "Intake and completeness review initialized.",
      },
    ];
  });

  // Success Toast Banner
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Re-run checklist validations whenever a switch is toggled
  useEffect(() => {
    const isTuition = caseData.programType === "TuitionReimbursement";
    const needsSA = isTuition && (employee.isNYSNA || caseData.amount > 3000);

    // Check if Stage 1 checklist requirements are met
    const allIntakeChecked = CHECKLIST_ITEMS.every((item) => {
      if (item.id === "serviceAgreement" && !needsSA) return true;
      if (
        item.id === "cmeSignatures" &&
        caseData.programType !== "CMEReimbursement"
      )
        return true;
      if (
        item.id === "acceptanceLetter" &&
        caseData.programType !== "DependentTuition"
      )
        return true;
      if (
        item.id === "scholarshipDeadline" &&
        caseData.programType !== "MMCScholarship"
      )
        return true;
      if (
        (item.id === "billQuality" || item.id === "gradesQuality") &&
        !isTuition
      )
        return true;

      return checklist[item.id];
    });

    if (allIntakeChecked && tier1Status === "incomplete") {
      setTier1Status("approved");
      logAction(
        "TIER1_COMPLIANCE_PASSED",
        "System",
        "admin",
        "All required 14 checklist items checked and passed.",
      );
    } else if (!allIntakeChecked && tier1Status === "approved") {
      setTier1Status("incomplete");
      logAction(
        "TIER1_COMPLIANCE_FAILED",
        "System",
        "admin",
        "Checklist requirements modified. Quality Gate incomplete.",
      );
    }
  }, [checklist]);

  const logAction = (
    action: string,
    actor: string,
    role: UserRole,
    details: string,
  ) => {
    const newLog: AuditEntry = {
      id: `a-${Date.now()}`,
      timestamp:
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
        " • " +
        new Date()
          .toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
          .toLowerCase(),
      action,
      actor,
      actorRole: role,
      entityId: caseData.id,
      entityType: "case",
      description: details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------

  // Header "Approve" Contextual Action
  const handleContextualApprove = () => {
    if (currentStage === 1) {
      if (tier1Status !== "approved") {
        alert(
          "Cannot approve Stage 1. Please ensure all required checklist items are checked in the 'SOP Checklist' tab.",
        );
        return;
      }
      setCurrentStage(2);
      setHwStatus("under-review");
      logAction(
        "STAGE1_COMPLETED",
        "System Admin",
        "admin",
        "Tier 1 Intake Approved. Application routed to Health & Wellbeing review.",
      );
      showToast("Stage 1 Intake Approved! Routed to H&W.");
    } else if (currentStage === 2) {
      setHwStatus("approved");
      setCurrentStage(3);
      logAction(
        "STAGE2_COMPLETED",
        "System Admin",
        "admin",
        "Health & Wellbeing review approved. Routed to Stage 3 Approval Signatures.",
      );
      showToast("Stage 2 Approved! Routed to Signatures.");
    } else if (currentStage === 3) {
      if (
        signatures.admin.status !== "complete" ||
        signatures.deptHead.status !== "complete"
      ) {
        alert(
          "Pending signatures. Complete all required signatures in the 'Timeline' stage below to proceed.",
        );
        return;
      }
      // Check notarized SA if required
      const needsSA =
        caseData.programType === "TuitionReimbursement" &&
        (employee.isNYSNA || caseData.amount > 3000);
      if (needsSA && !checklist.serviceAgreement) {
        alert(
          "Blocking Rule: Notarized Service Agreement required for payroll posting.",
        );
        return;
      }
      setCurrentStage(4);
      setPayrollStatus("awaiting");
      logAction(
        "STAGE3_COMPLETED",
        "System",
        "admin",
        "All signatures completed. Routed to Stage 4 Payroll.",
      );
      showToast("Stage 3 Completed! Routed to Payroll.");
    } else if (currentStage === 4) {
      setPayrollStatus("processed");
      setCurrentStage(5);
      logAction(
        "STAGE4_COMPLETED",
        "System Admin",
        "admin",
        "Posted to Workday Payroll. GL Code: 61200-TUIT assigned. Tax split optimized.",
      );
      showToast("Stage 4 Completed! Posted to Workday.");
    } else if (currentStage === 5) {
      setPaymentStatus("paid");
      logAction(
        "STAGE5_COMPLETED",
        "System",
        "admin",
        "Reimbursement paid in paycheck distribution. Application completed.",
      );
      showToast("Reimbursement Paid! Case marked complete.");
    }
  };

  // Header "Reject"
  const handleContextualReject = () => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    if (currentStage === 1) {
      setTier1Status("incomplete");
      logAction(
        "TIER1_REJECTED",
        "System Admin",
        "admin",
        `Returned to employee. Reason: ${reason}`,
      );
      showToast("Intake incomplete. Sent back to employee.");
    } else if (currentStage === 2) {
      setHwStatus("rejected");
      logAction(
        "HW_REJECTED",
        "System Admin",
        "admin",
        `H&W rejected. Reason: ${reason}`,
      );
      showToast("H&W review rejected.");
    } else {
      logAction(
        "CASE_REJECTED",
        "System Admin",
        "admin",
        `Case rejected. Reason: ${reason}`,
      );
      showToast("Case rejected.");
    }
  };

  // Header "Escalate"
  const handleContextualEscalate = () => {
    const reason = prompt("Enter escalation reason:");
    if (!reason) return;

    setTier1Status("escalated");
    logAction(
      "CASE_ESCALATED",
      "System Admin",
      "admin",
      `Case escalated to Benefits Director. Reason: ${reason}`,
    );
    showToast("Case escalated to Benefits Director.");
  };

  // Signature Submissions
  const handleAdminSign = () => {
    if (!adminNameInput.trim() || !adminSigChecked || !adminDateInput.trim()) {
      alert(
        "Signature Validation Failed: Printed Name, Checked Signature box, and Date are all required per SOP Section 5.",
      );
      return;
    }
    // Date format validation
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(adminDateInput)) {
      alert("Signature Validation Failed: Date must be in MM/DD/YYYY format.");
      return;
    }

    setSignatures((prev) => ({
      ...prev,
      admin: {
        role: "Administrator",
        name: adminNameInput,
        date: adminDateInput,
        status: "complete" as const,
        order: 2,
      },
    }));
    // Also toggle the checklist item of signatures
    setChecklist((prev) => ({
      ...prev,
      allSignatures: signatures.deptHead.status === "complete",
    }));
    logAction(
      "SIGNATURE_ADDED",
      "System Admin",
      "admin",
      `Administrator signature verified. Name: ${adminNameInput}. Date: ${adminDateInput}.`,
    );
    showToast("Administrator signature added!");
  };

  const handleDeptHeadSign = () => {
    // Check sequential rule
    if (signatures.admin.status !== "complete") {
      alert(
        "SOP Blocking Rule: First signature line (Administrator) must complete before Department Head can sign.",
      );
      return;
    }

    if (
      !deptHeadNameInput.trim() ||
      !deptHeadSigChecked ||
      !deptHeadDateInput.trim()
    ) {
      alert(
        "Signature Validation Failed: Printed Name, Checked Signature box, and Date are all required per SOP Section 5.",
      );
      return;
    }
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(deptHeadDateInput)) {
      alert("Signature Validation Failed: Date must be in MM/DD/YYYY format.");
      return;
    }

    setSignatures((prev) => ({
      ...prev,
      deptHead: {
        role: "Department Head",
        name: deptHeadNameInput,
        date: deptHeadDateInput,
        status: "complete" as const,
        order: 3,
      },
    }));
    setChecklist((prev) => ({ ...prev, allSignatures: true }));
    logAction(
      "SIGNATURE_ADDED",
      "Dr. James Okonkwo",
      "manager",
      `Department Head signature verified. Name: ${deptHeadNameInput}. Date: ${deptHeadDateInput}.`,
    );
    showToast("Department Head signature added!");
  };

  // Determine required checklists items
  const isChecklistItemRequired = (itemId: string) => {
    if (itemId === "serviceAgreement") {
      return (
        caseData.programType === "TuitionReimbursement" &&
        (employee.isNYSNA || caseData.amount > 3000)
      );
    }
    if (itemId === "cmeSignatures") {
      return caseData.programType === "CMEReimbursement";
    }
    if (itemId === "acceptanceLetter") {
      return caseData.programType === "DependentTuition";
    }
    if (itemId === "scholarshipDeadline") {
      return caseData.programType === "MMCScholarship";
    }
    if (itemId === "billQuality" || itemId === "gradesQuality") {
      return caseData.programType === "TuitionReimbursement";
    }
    return true;
  };

  const activeAlerts = () => {
    const list = [];
    if (currentStage === 1 && tier1Status === "incomplete") {
      list.push({
        id: "alert-1",
        severity: "critical" as const,
        title: "Stage 1 Gate: Incomplete Intake Review",
        message:
          "All 14 checklist items must be validated in the 'SOP Checklist' tab to proceed.",
      });
    }
    if (
      currentStage === 3 &&
      (signatures.admin.status === "pending" ||
        signatures.deptHead.status === "pending")
    ) {
      list.push({
        id: "alert-2",
        severity: "critical" as const,
        title: "Stage 3 Gate: Signatures Pending",
        message: `Awaiting signature completion: Administrator (${signatures.admin.status}), Department Head (${signatures.deptHead.status}).`,
      });
    }
    if (
      caseData.programType === "TuitionReimbursement" &&
      (employee.isNYSNA || caseData.amount > 3000)
    ) {
      if (!checklist.serviceAgreement) {
        list.push({
          id: "alert-3",
          severity: "warning" as const,
          title: "Service Agreement Required",
          message:
            "A notarized Service Agreement is required per SOP Section 7 for tuition reimbursement. Lock this item before Stage 4.",
        });
      }
    }
    if (currentStage === 2 && hwStatus === "under-review") {
      list.push({
        id: "alert-4",
        severity: "info" as const,
        title: "Health & Wellbeing Review Active",
        message:
          "Benefits Administrator is performing policy eligibility checks and credit limit calculations.",
      });
    }
    return list;
  };

  const getStageBadge = (stageNum: number, statusStr: string) => {
    if (
      currentStage > stageNum ||
      statusStr === "approved" ||
      statusStr === "complete" ||
      statusStr === "processed" ||
      statusStr === "paid"
    ) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] uppercase font-bold px-1.5 h-4.5">
          Verified
        </Badge>
      );
    }
    if (currentStage === stageNum) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] uppercase font-bold px-1.5 h-4.5 animate-pulse">
          Current
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-100 text-slate-400 border-slate-200 text-[9px] uppercase font-bold px-1.5 h-4.5">
        Pending
      </Badge>
    );
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <Layout
      title={`Case ${caseData.id}`}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: `Case ${caseData.id}` },
      ]}
      disableScroll={true}
    >
      <div className="flex flex-col xl:flex-row xl:flex-1 xl:min-h-0 xl:overflow-hidden bg-muted/20">
        {/* Left Sidebar: Employee Profile */}
        <aside className="w-full xl:w-72 bg-card border-b xl:border-b-0 xl:border-r border-border xl:overflow-y-auto flex-shrink-0 xl:h-auto">
          <div className="p-6 flex flex-col md:flex-row xl:flex-col gap-6 md:items-start xl:items-stretch space-y-0">
            <div className="flex flex-col items-center text-center space-y-3 md:w-1/4 xl:w-full flex-shrink-0">
              <Avatar className="w-20 h-20 border-2 border-primary/10 shadow-sm">
                <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                  {employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-foreground leading-tight">
                  {employee.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {employee.title}
                </p>
                <Badge
                  variant="outline"
                  className="mt-2 text-[10px] font-mono border-primary/20 text-primary"
                >
                  {employee.employeeId}
                </Badge>
              </div>
            </div>

            <Separator className="hidden xl:block" />

            <div className="space-y-4 flex-grow md:grid md:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-col gap-4 md:space-y-0 xl:space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Department
                </p>
                <p className="text-xs font-medium">{employee.department}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Hire Date
                </p>
                <p className="text-xs font-medium">Jan 18, 2021 • 5 yrs</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="text-xs font-medium text-primary hover:underline cursor-pointer truncate">
                  {employee.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Phone
                </p>
                <p className="text-xs font-medium">{employee.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" /> Manager
                </p>
                <p className="text-xs font-medium text-primary hover:underline cursor-pointer">
                  Dr. James Okonkwo
                </p>
              </div>
            </div>

            <Separator className="hidden xl:block" />

            <div className="space-y-4 md:w-1/3 xl:w-full flex-shrink-0">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                  Benefit Balances
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                      Tuition
                    </span>
                    <span className="font-bold">
                      {formatCurrency(employee.tuitionBalance)}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        / $5,000
                      </span>
                    </span>
                  </div>
                  <Progress
                    value={(employee.tuitionUsed / employee.tuitionMax) * 100}
                    className="h-1 bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                      Credits
                    </span>
                    <span className="font-bold">
                      {employee.creditBalance}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        remaining of 18
                      </span>
                    </span>
                  </div>
                  <Progress
                    value={(employee.creditUsed / employee.creditMax) * 100}
                    className="h-1 bg-muted"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full text-xs h-9 border-primary/20 text-primary hover:bg-primary/5"
              >
                View Full Profile
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Case Content */}
        <div className="flex-1 flex flex-col min-w-0 xl:h-full xl:overflow-hidden">
          {/* Case Header */}
          <header className="bg-card border-b border-border p-4 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <StatusBadge status={caseData.status} size="sm" />
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                  >
                    On Track
                  </Badge>
                  <AIConfidenceBadge
                    confidence={caseData.aiConfidence}
                    size="sm"
                  />
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 bg-amber-500/5 text-amber-600 border-amber-500/20"
                  >
                    Medium
                  </Badge>
                </div>
                <h1 className="text-sm font-bold text-foreground truncate">
                  Case {caseData.id} • {caseData.employeeName}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button
                size="sm"
                onClick={handleContextualApprove}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {currentStage === 1 && "Intake Approve (Stage 1)"}
                {currentStage === 2 && "H&W Approve (Stage 2)"}
                {currentStage === 3 && "Verify Signatures (Stage 3)"}
                {currentStage === 4 && "Post to Payroll (Stage 4)"}
                {currentStage === 5 && "Release Payment (Stage 5)"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleContextualReject}
                className="h-9 px-4 text-destructive border-destructive/20 hover:bg-destructive/5 gap-2"
              >
                <Zap className="w-4 h-4 rotate-180" /> Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleContextualEscalate}
                className="h-9 px-4 text-amber-600 border-amber-500/20 hover:bg-amber-500/5 gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> Escalate
              </Button>
            </div>
          </header>

          {/* DYNAMIC SUCCESS TOAST BANNER */}
          {successToast && (
            <div className="fixed bottom-6 left-6 z-[200] bg-emerald-600 border border-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="text-xs font-bold">{successToast}</span>
            </div>
          )}

          <main className="flex-1 p-6 space-y-6 xl:overflow-y-auto">
            {/* ALERT PRIORITY MATRIX (Rule 6) */}
            {activeAlerts().map((alert) => (
              <div
                key={alert.id}
                className={[
                  "p-4 rounded-xl border flex items-start gap-3 shadow-sm transition-all animate-in fade-in",
                  alert.severity === "critical" &&
                    "bg-red-50 border-red-100 text-red-900 dark:bg-red-950/20 dark:text-red-300 dark:border-red-950",
                  alert.severity === "warning" &&
                    "bg-amber-50 border-amber-100 text-amber-900 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-950",
                  alert.severity === "info" &&
                    "bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-950",
                ].join(" ")}
              >
                {alert.severity === "critical" && (
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                )}
                {alert.severity === "warning" && (
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                )}
                {alert.severity === "info" && (
                  <Info className="w-4.5 h-4.5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                )}
                <div className="text-xs">
                  <p className="font-bold">{alert.title}</p>
                  <p className="mt-0.5 text-muted-foreground leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}

            {/* Case Summary Card */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-0">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={caseData.status} size="sm" />
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                        >
                          On Track
                        </Badge>
                      </div>
                      <h2 className="text-lg font-bold text-foreground leading-tight">
                        Health Informatics & Data Analytics (HIT 520)
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fordham University • Spring 2026
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      $2,400
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      9 credits
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border bg-muted/10 divide-x divide-border">
                  <div className="p-4 space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Case ID
                    </p>
                    <p className="text-xs font-bold font-mono">{caseData.id}</p>
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Submitted
                    </p>
                    <p className="text-xs font-bold">Apr 20, 2026</p>
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due Date
                    </p>
                    <p className="text-xs font-bold">Jun 4, 2026</p>
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <User className="w-3 h-3" /> Assigned Admin
                    </p>
                    <p className="text-xs font-bold italic">
                      {caseData.assignedAdmin}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="bg-brand-lightblue p-1.5 h-auto rounded-xl inline-flex items-center gap-1 border-none mb-6 max-w-full overflow-x-auto no-scrollbar">
                <TabsTrigger
                  value="timeline"
                  className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all"
                >
                  Timeline Workflow
                </TabsTrigger>
                <TabsTrigger
                  value="checklist"
                  className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all gap-2"
                >
                  SOP Checklist{" "}
                  <span className="bg-brand-blue text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center">
                    14
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all gap-2"
                >
                  Documents{" "}
                  <span className="bg-brand-teal text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center">
                    3
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all gap-2"
                >
                  Notes{" "}
                  <span className="bg-brand-teal text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center">
                    3
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="audit"
                  className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all gap-2"
                >
                  Audit Trail
                </TabsTrigger>
              </TabsList>

              {/* TIMELINE TAB CONTENT (Rule 1: 5-Stage Machine) */}
              <TabsContent value="timeline" className="pt-0">
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Authoritative 5-Stage Approval Engine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-4 relative pb-10">
                    <div className="absolute left-[2.4rem] top-10 bottom-10 w-0.5 bg-border z-0" />

                    {/* STAGE 1 */}
                    <div className="flex gap-6 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${currentStage > 1 ? "bg-emerald-500 text-white border-emerald-500" : currentStage === 1 ? "bg-white text-primary border-primary" : "bg-muted text-muted-foreground border-border"}`}
                      >
                        {currentStage > 1 ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">1</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 justify-between">
                          <h3 className="text-xs font-bold text-foreground">
                            Stage 1: Tier 1 Intake & Completeness Review
                          </h3>
                          {getStageBadge(1, tier1Status)}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Enforces SOP Section 10 checks. System validates
                          correct submission path, program rules, document
                          attachments, and signature completeness.
                        </p>
                        {currentStage === 1 && (
                          <div className="mt-3 p-3 bg-muted/20 border rounded-xl flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">
                              Checklist Status:{" "}
                              {tier1Status === "approved"
                                ? "Passed ✅"
                                : "Incomplete ⏳"}
                            </span>
                            <Button
                              size="sm"
                              disabled={tier1Status !== "approved"}
                              onClick={() => {
                                setCurrentStage(2);
                                setHwStatus("under-review");
                                logAction(
                                  "STAGE1_COMPLETED",
                                  "System Admin",
                                  "admin",
                                  "Intake approved. Routed to Health & Wellbeing review.",
                                );
                                showToast("Stage 1 Approved! Routed to H&W.");
                              }}
                              className="h-8 text-[10px] bg-primary font-bold text-white shadow-sm"
                            >
                              Approve Stage 1 Intake
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STAGE 2 */}
                    <div className="flex gap-6 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${currentStage > 2 ? "bg-emerald-500 text-white border-emerald-500" : currentStage === 2 ? "bg-white text-primary border-primary" : "bg-muted text-muted-foreground border-border"}`}
                      >
                        {currentStage > 2 ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">2</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 justify-between">
                          <h3 className="text-xs font-bold text-foreground">
                            Stage 2: Health & Wellbeing Review
                          </h3>
                          {getStageBadge(2, hwStatus)}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Benefits Administrator validates policy compliance,
                          tenure eligibility, balances, and generates the
                          required Service Agreement.
                        </p>
                        {currentStage === 2 && (
                          <div className="mt-3 p-3 bg-muted/20 border rounded-xl flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">
                              H&W Status: {hwStatus}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setHwStatus("approved");
                                setCurrentStage(3);
                                logAction(
                                  "STAGE2_COMPLETED",
                                  "System Admin",
                                  "admin",
                                  "Health & Wellbeing review completed and approved.",
                                );
                                showToast(
                                  "Stage 2 Approved! Routed to Signatures.",
                                );
                              }}
                              className="h-8 text-[10px] bg-primary font-bold text-white shadow-sm"
                            >
                              Approve H&W Policy Compliance
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STAGE 3 */}
                    <div className="flex gap-6 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${currentStage > 3 ? "bg-emerald-500 text-white border-emerald-500" : currentStage === 3 ? "bg-white text-primary border-primary" : "bg-muted text-muted-foreground border-border"}`}
                      >
                        {currentStage > 3 ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">3</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 justify-between">
                          <h3 className="text-xs font-bold text-foreground">
                            Stage 3: Approval Signatures (3-Part Validation)
                          </h3>
                          {getStageBadge(3, signatures.deptHead.status)}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Validates sequential approval signoff per program
                          rules. A signature is ONLY valid if it has printed
                          name + handwritten signature + date.
                        </p>

                        {/* Signatures List */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-[11px] p-2 bg-muted/20 rounded-lg border">
                            <span>
                              Line 1: <strong>Employee</strong> ({employee.name}
                              )
                            </span>
                            <Badge className="bg-emerald-50 text-emerald-700 text-[9px]">
                              ✅ Signed {signatures.employee.date}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-[11px] p-2 bg-muted/20 rounded-lg border">
                            <span>
                              Line 2: <strong>Administrator</strong> (System
                              Admin)
                            </span>
                            {signatures.admin.status === "complete" ? (
                              <Badge className="bg-emerald-50 text-emerald-700 text-[9px]">
                                ✅ Signed {signatures.admin.date}
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-50 text-amber-700 text-[9px]">
                                ⏳ Pending
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] p-2 bg-muted/20 rounded-lg border">
                            <span>
                              Line 3: <strong>Department Head</strong> (Dr.
                              James Okonkwo)
                            </span>
                            {signatures.deptHead.status === "complete" ? (
                              <Badge className="bg-emerald-50 text-emerald-700 text-[9px]">
                                ✅ Signed {signatures.deptHead.date}
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-400 text-[9px]">
                                ⏳ Blocked
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Dynamic Sign-in panels */}
                        {currentStage === 3 &&
                          signatures.admin.status === "pending" && (
                            <div className="mt-4 p-3 border rounded-xl bg-card space-y-3 shadow-inner animate-in fade-in">
                              <p className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-primary">
                                <FileSignature className="w-3.5 h-3.5" /> Sign
                                as Administrator (System Admin)
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase">
                                    Printed Name
                                  </label>
                                  <input
                                    type="text"
                                    value={adminNameInput}
                                    onChange={(e) =>
                                      setAdminNameInput(e.target.value)
                                    }
                                    placeholder="System Admin"
                                    className="w-full text-xs h-8 px-2.5 border rounded-lg bg-card outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase">
                                    Handwritten Sig Box
                                  </label>
                                  <div
                                    className="flex items-center gap-2 h-8 px-2 border rounded-lg bg-card cursor-pointer"
                                    onClick={() =>
                                      setAdminSigChecked(!adminSigChecked)
                                    }
                                  >
                                    <input
                                      type="checkbox"
                                      checked={adminSigChecked}
                                      onChange={(e) =>
                                        setAdminSigChecked(e.target.checked)
                                      }
                                      className="w-4 h-4 rounded text-primary"
                                    />
                                    <span className="text-[10px] font-bold italic text-muted-foreground">
                                      Draw handwriting signature
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase">
                                    Date Signed
                                  </label>
                                  <input
                                    type="text"
                                    value={adminDateInput}
                                    onChange={(e) =>
                                      setAdminDateInput(e.target.value)
                                    }
                                    placeholder="MM/DD/YYYY"
                                    className="w-full text-xs h-8 px-2.5 border rounded-lg bg-card outline-none"
                                  />
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={handleAdminSign}
                                className="h-8 text-[10px] bg-primary font-bold text-white shadow-sm w-full"
                              >
                                Verify & Add Administrator Signature
                              </Button>
                            </div>
                          )}

                        {currentStage === 3 &&
                          signatures.admin.status === "complete" &&
                          signatures.deptHead.status === "pending" && (
                            <div className="mt-4 p-3 border rounded-xl bg-card space-y-3 shadow-inner animate-in fade-in">
                              <p className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-primary">
                                <FileSignature className="w-3.5 h-3.5" /> Sign
                                as Department Head (Dr. James Okonkwo)
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase">
                                    Printed Name
                                  </label>
                                  <input
                                    type="text"
                                    value={deptHeadNameInput}
                                    onChange={(e) =>
                                      setDeptHeadNameInput(e.target.value)
                                    }
                                    placeholder="Dr. James Okonkwo"
                                    className="w-full text-xs h-8 px-2.5 border rounded-lg bg-card outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase">
                                    Handwritten Sig Box
                                  </label>
                                  <div
                                    className="flex items-center gap-2 h-8 px-2 border rounded-lg bg-card cursor-pointer"
                                    onClick={() =>
                                      setDeptHeadSigChecked(!deptHeadSigChecked)
                                    }
                                  >
                                    <input
                                      type="checkbox"
                                      checked={deptHeadSigChecked}
                                      onChange={(e) =>
                                        setDeptHeadSigChecked(e.target.checked)
                                      }
                                      className="w-4 h-4 rounded text-primary"
                                    />
                                    <span className="text-[10px] font-bold italic text-muted-foreground">
                                      Draw handwriting signature
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-muted-foreground uppercase">
                                    Date Signed
                                  </label>
                                  <input
                                    type="text"
                                    value={deptHeadDateInput}
                                    onChange={(e) =>
                                      setDeptHeadDateInput(e.target.value)
                                    }
                                    placeholder="MM/DD/YYYY"
                                    className="w-full text-xs h-8 px-2.5 border rounded-lg bg-card outline-none"
                                  />
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={handleDeptHeadSign}
                                className="h-8 text-[10px] bg-primary font-bold text-white shadow-sm w-full"
                              >
                                Verify & Add Department Head Signature
                              </Button>
                            </div>
                          )}

                        {currentStage === 3 &&
                          signatures.admin.status === "complete" &&
                          signatures.deptHead.status === "complete" && (
                            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-950 rounded-xl flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-emerald-800">
                                Checklist Status: Signatures Verified ✅
                              </span>
                              <Button
                                size="sm"
                                onClick={() => {
                                  // Check SA notarization
                                  const needsSA =
                                    caseData.programType ===
                                      "TuitionReimbursement" &&
                                    (employee.isNYSNA ||
                                      caseData.amount > 3000);
                                  if (needsSA && !checklist.serviceAgreement) {
                                    alert(
                                      "Blocking Rule: Notarized Service Agreement required for payroll posting.",
                                    );
                                    return;
                                  }
                                  setCurrentStage(4);
                                  setPayrollStatus("awaiting");
                                  logAction(
                                    "STAGE3_COMPLETED",
                                    "System",
                                    "admin",
                                    "Signatures verified. Routed to Stage 4 Payroll.",
                                  );
                                  showToast(
                                    "Stage 3 Approved! Routed to Payroll.",
                                  );
                                }}
                                className="h-8 text-[10px] bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-sm"
                              >
                                Verify & Advance to Payroll
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* STAGE 4 */}
                    <div className="flex gap-6 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${currentStage > 4 ? "bg-emerald-500 text-white border-emerald-500" : currentStage === 4 ? "bg-white text-primary border-primary" : "bg-muted text-muted-foreground border-border"}`}
                      >
                        {currentStage > 4 ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">4</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 justify-between">
                          <h3 className="text-xs font-bold text-foreground">
                            Stage 4: Payroll Processing
                          </h3>
                          {getStageBadge(4, payrollStatus)}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Reimbursement is synced to Workday ERP and processed
                          under IRS §127 tax split rules.
                        </p>
                        {currentStage === 4 && (
                          <div className="mt-3 p-3 bg-muted/20 border rounded-xl flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">
                              Status: Awaiting Post
                            </span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setPayrollStatus("processed");
                                setCurrentStage(5);
                                logAction(
                                  "STAGE4_COMPLETED",
                                  "System Admin",
                                  "admin",
                                  "Sync + post to Workday payroll complete. Pre-tax optimization active.",
                                );
                                showToast(
                                  "Stage 4 Approved! Posted to Workday.",
                                );
                              }}
                              className="h-8 text-[10px] bg-primary font-bold text-white shadow-sm"
                            >
                              Sync & Post to Workday
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STAGE 5 */}
                    <div className="flex gap-6 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${currentStage > 5 || paymentStatus === "paid" ? "bg-emerald-500 text-white border-emerald-500" : currentStage === 5 ? "bg-white text-primary border-primary" : "bg-muted text-muted-foreground border-border"}`}
                      >
                        {paymentStatus === "paid" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">5</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 justify-between">
                          <h3 className="text-xs font-bold text-foreground">
                            Stage 5: Payment Completion
                          </h3>
                          {getStageBadge(5, paymentStatus)}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Payment posted to employee's bi-weekly paycheck
                          distribution. 10-year immutable audit log finalized.
                        </p>
                        {currentStage === 5 && paymentStatus !== "paid" && (
                          <div className="mt-3 p-3 bg-muted/20 border rounded-xl flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">
                              Status: Scheduled
                            </span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setPaymentStatus("paid");
                                logAction(
                                  "STAGE5_COMPLETED",
                                  "System",
                                  "admin",
                                  "Reimbursement paid. Verification final.",
                                );
                                showToast(
                                  "Payment release verified! Case complete.",
                                );
                              }}
                              className="h-8 text-[10px] bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-sm"
                            >
                              Release & Confirm Payment
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SOP CHECKLIST TAB CONTENT (Rule 4: 14-Point Quality Gate) */}
              <TabsContent value="checklist" className="pt-0">
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      SOP Section 10 checklist (14-Point Intake Review)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-6 pb-6 space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-950 rounded-xl flex items-start gap-2.5 text-blue-800 dark:text-blue-300">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-relaxed">
                        Verify application files against quality compliance
                        checklist gates. Stage 1 routes automatically once all
                        required items pass.
                      </p>
                    </div>

                    <div className="divide-y divide-border/60">
                      {CHECKLIST_ITEMS.map((item) => {
                        const required = isChecklistItemRequired(item.id);
                        const val = checklist[item.id];
                        return (
                          <div
                            key={item.id}
                            className="py-3 flex items-center justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-[11px] font-bold text-foreground">
                                  {item.label}
                                </p>
                                {required ? (
                                  <Badge className="bg-rose-50 text-rose-700 text-[8px] font-bold h-4 px-1.5">
                                    Required
                                  </Badge>
                                ) : (
                                  <Badge className="bg-slate-100 text-slate-400 text-[8px] font-bold h-4 px-1.5 border-transparent">
                                    N/A (NYSNA/Program)
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={
                                  val
                                    ? "text-[10px] font-bold text-emerald-600"
                                    : "text-[10px] font-bold text-rose-600"
                                }
                              >
                                {val ? "Pass" : "Fail"}
                              </span>
                              <Switch
                                checked={val}
                                onCheckedChange={(checked) => {
                                  setChecklist((prev) => ({
                                    ...prev,
                                    [item.id]: checked,
                                  }));
                                  logAction(
                                    checked
                                      ? "CHECKLIST_ITEM_PASSED"
                                      : "CHECKLIST_ITEM_FAILED",
                                    "System Admin",
                                    "admin",
                                    `Checklist item '${item.label}' changed to ${checked ? "Pass" : "Fail"}.`,
                                  );
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="pt-0">
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Uploaded Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {[
                      {
                        name: "Enrollment_Spring2026.pdf",
                        type: "Enrollment",
                        size: "245 KB",
                        date: "Apr 15, 2026",
                        status: "Verified",
                        confidence: 97,
                      },
                      {
                        name: "Tuition_Receipt_Spring2026.pdf",
                        type: "Receipt",
                        size: "178 KB",
                        date: "Apr 15, 2026",
                        status: "Verified",
                        confidence: 94,
                      },
                      {
                        name: "Official_Transcript_Fall2025.pdf",
                        type: "Transcript",
                        size: "512 KB",
                        date: "Apr 15, 2026",
                        status: "Pending Review",
                        confidence: 73,
                        alert: true,
                      },
                    ].map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-white group-hover:text-primary transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-foreground">
                                {doc.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[9px] h-5 px-1.5 ${doc.alert ? "bg-violet-50 text-violet-600 border-violet-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}
                              >
                                {doc.status}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {doc.type} • {doc.size} • {doc.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                            <Brain
                              className={`w-3.5 h-3.5 ${doc.confidence > 90 ? "text-emerald-500" : "text-amber-500"}`}
                            />
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full ${doc.confidence > 90 ? "bg-emerald-500" : "bg-amber-500"}`}
                                style={{ width: `${doc.confidence}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-foreground">
                              {doc.confidence}%
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="notes" className="pt-0">
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Notes & Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    {[
                      {
                        name: "System Admin",
                        role: "Benefits Admin",
                        time: "Apr 16, 2026, 2:45 pm",
                        initials: "PN",
                        color: "blue",
                        text: "Reviewed all submitted documents. Enrollment confirmed with CUNY Lehman registrar. Receipt matches tuition schedule. Transcript still in pending state — AI OCR flagged for manual review. Forwarding to manager for approval once transcript is cleared.",
                      },
                      {
                        name: "Dr. James Okonkwo",
                        role: "Nurse Manager",
                        time: "Apr 17, 2026, 8:00 pm",
                        initials: "DJ",
                        color: "emerald",
                        text: "Maria is an outstanding team member and this course directly supports her role as charge nurse. I fully support this application. Pending Admin clearance of transcript.",
                      },
                      {
                        name: "System Admin",
                        role: "Benefits Admin",
                        time: "Apr 22, 2026, 4:30 pm",
                        initials: "PN",
                        color: "blue",
                        text: "Transcript re-submitted for AI reprocessing. OCR confidence improved to 73%. Manual verification in progress. SLA clock at 7 days. Expected resolution by Apr 29.",
                      },
                    ].map((note, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback
                                className={`bg-${note.color}-500/10 text-${note.color}-600 text-[10px] font-bold`}
                              >
                                {note.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-foreground">
                              {note.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] h-4 px-1 bg-muted/50 text-muted-foreground border-transparent"
                            >
                              {note.role}
                            </Badge>
                          </div>
                          <span className="text-[9px] text-muted-foreground">
                            {note.time}
                          </span>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                          <p className="text-[11px] text-foreground leading-relaxed">
                            {note.text}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 space-y-3">
                      <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                        Add Comment
                      </p>
                      <textarea
                        className="w-full min-h-[100px] rounded-xl border border-border bg-background p-4 text-[11px] focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="Write a note or comment for this case..."
                      />
                      <Button size="sm" className="h-9 gap-2 bg-primary">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Add Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DYNAMIC AUDIT TRAIL TAB */}
              <TabsContent value="audit" className="pt-0">
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Immutable Compliance Audit History (10-Year Retention)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-0 pb-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent bg-muted/30 border-b border-border">
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-10 px-6">
                              Action
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-10 px-6">
                              Performed By
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-10 px-6">
                              Timestamp
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-10 px-6">
                              Details
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditLogs.map((entry) => (
                            <TableRow
                              key={entry.id}
                              className="border-b border-border/50 hover:bg-muted/20"
                            >
                              <TableCell className="px-6">
                                <Badge
                                  variant="outline"
                                  className="text-[9px] font-mono bg-muted/50 border-border/50 text-foreground"
                                >
                                  {entry.action}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-foreground">
                                    {entry.actor}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[8px] h-4 px-1 bg-primary/5 text-primary border-primary/20"
                                  >
                                    {entry.actorRole}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 text-[10px] text-muted-foreground whitespace-nowrap">
                                {entry.timestamp}
                              </TableCell>
                              <TableCell className="px-6 text-[10px] text-muted-foreground leading-relaxed">
                                {entry.description}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </Layout>
  );
}
