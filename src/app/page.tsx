"use client";

import { Layout } from "@/components/layout/Layout";
import LandingPage from "@/components/landing/LandingPage";
import { AIConfidenceBadge } from "@/components/ui/AIConfidenceBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  mockApplications,
  mockEmployees,
  mockNotifications,
  mockPrograms,
  mockServiceAgreements,
} from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Brain,
  CalendarClock,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  FilePlus,
  FileSignature,
  GraduationCap,
  Heart,
  Info,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const PROGRAM_ICONS: Record<string, React.ReactNode> = {
  TuitionReimbursement: <GraduationCap className="w-5 h-5" />,
  CMEReimbursement: <Heart className="w-5 h-5" />,
  MMCScholarship: <Star className="w-5 h-5" />,
  DependentTuition: <Users className="w-5 h-5" />,
};

const PROGRAM_COLORS: Record<string, string> = {
  TuitionReimbursement:
    "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  CMEReimbursement:
    "bg-accent/10 text-accent-foreground dark:bg-accent/20 dark:text-accent",
  MMCScholarship:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  DependentTuition:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
};

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  approval: (
    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
  ),
  deadline: (
    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
  ),
  status_change: <Clock className="w-4 h-4 text-primary" />,
  sla: <AlertTriangle className="w-4 h-4 text-destructive" />,
  document: <BookOpen className="w-4 h-4 text-primary" />,
  system: <Info className="w-4 h-4 text-muted-foreground" />,
};

const AI_RECS = [
  {
    id: "rec-1",
    text: "You're eligible for CME reimbursement — renews July 1. Submit your next CME by June 30 to avoid losing $2,500.",
    confidence: 97,
    icon: <Heart className="w-4 h-4" />,
  },
  {
    id: "rec-2",
    text: "Spring 2026 transcript from CUNY Lehman must be submitted by May 31, 2026 to complete application MTRA-2026-0041.",
    confidence: 94,
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    id: "rec-3",
    text: "Your service agreement for application MTRA-2026-0041 requires an e-signature within 7 days or it will be auto-withdrawn.",
    confidence: 88,
    icon: <Brain className="w-4 h-4" />,
  },
];

const DEADLINES = [
  {
    id: "dl-1",
    label: "Service Agreement Signature",
    sub: "Application MTRA-2026-0041",
    date: "May 9, 2026",
    daysLeft: 2,
  },
  {
    id: "dl-2",
    label: "Spring 2026 Transcript Submission",
    sub: "CUNY Lehman College",
    date: "May 31, 2026",
    daysLeft: 24,
  },
  {
    id: "dl-3",
    label: "MMC Scholarship Cycle Closes",
    sub: "Committee review",
    date: "Jun 30, 2026",
    daysLeft: 54,
  },
];

function deadlineColor(days: number) {
  if (days <= 7)
    return "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-400";
  if (days <= 14)
    return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300";
  return "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300";
}

function deadlineDot(days: number) {
  if (days <= 7) return "bg-destructive";
  if (days <= 14) return "bg-amber-500";
  return "bg-emerald-500";
}

function getTenureYears(hireDateStr: string) {
  const hireDate = new Date(hireDateStr);
  const now = new Date("2026-06-26"); // Set target date for consistency with mock data context
  const diffTime = Math.abs(now.getTime() - hireDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays / 365.25;
}

function isEligibleForProgram(employee: (typeof mockEmployees)[number], programType: string) {
  const tenure = getTenureYears(employee.hireDate);
  const isPaOrPt =
    employee.title.toLowerCase().includes("physician assistant") ||
    employee.title.toLowerCase().includes("pa") ||
    employee.title.toLowerCase().includes("physical therapist") ||
    employee.title.toLowerCase().includes("pt");

  const isPhysicianOrScientistOrExec =
    employee.title.toLowerCase().includes("physician") ||
    employee.title.toLowerCase().includes("scientist") ||
    employee.title.toLowerCase().includes("executive") ||
    employee.title.toLowerCase().includes("md") ||
    employee.title.toLowerCase().includes("director") ||
    employee.title.toLowerCase().includes("chief");

  switch (programType) {
    case "TuitionReimbursement":
      return tenure >= 0.5; // 6 months
    case "CMEReimbursement":
      return isPaOrPt; // Physician Assistants and Weiler PTs only, not nurses
    case "MMCScholarship":
      return tenure >= 3.0; // 3 years
    case "DependentTuition":
      return isPhysicianOrScientistOrExec && tenure >= 5.0; // Physicians, Scientists, and Executives only
    default:
      return false;
  }
}

function DashboardPage() {
  const { currentUser, isAuthenticated, hasHydrated } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated) {
      if (currentUser?.role === "manager") {
        router.replace("/approvals");
      }
    }
  }, [hasHydrated, currentUser, router]);

  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);
  const [readNotifs] = useState<string[]>([]);
  const [markedAllRead, setMarkedAllRead] = useState(false);

  const employee =
    mockEmployees.find((e) => e.employeeId === currentUser?.employeeId) ??
    mockEmployees[0];

  const isNysna = employee.isNYSNA === true;

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-muted-foreground">Checking authentication...</span>
        </div>
      </div>
    );
  }

  const myApps = mockApplications.filter((a) => a.employeeId === employee.id);
  const activeApps = myApps.filter(
    (a) => !["Approved", "Rejected"].includes(a.status),
  );
  const approvedApps = myApps.filter((a) => a.status === "Approved");
  const ytdReimbursed = approvedApps.reduce((sum, a) => sum + a.amount, 0);

  const employeeNotifs = mockNotifications
    .filter((n) => n.userId === employee.id)
    .filter((n) => n.title !== "New Program Available" && !n.title.toLowerCase().includes("program available"));

  const hasActionNeeded = employeeNotifs.some((n) =>
    n.title.toLowerCase().includes("service agreement"),
  );

  const unreadNotifs = markedAllRead
    ? []
    : employeeNotifs.filter((n) => !n.read && !readNotifs.includes(n.id));

  const activeStatusBreakdown = [
    {
      label: "Submitted",
      count: myApps.filter((a) => a.status === "Submitted").length,
      color: "bg-primary",
    },
    {
      label: "Under Review",
      count: myApps.filter((a) => a.status === "UnderReview").length,
      color: "bg-amber-500",
    },
    {
      label: "Pending Approval",
      count: myApps.filter((a) => a.status === "PendingApproval").length,
      color: "bg-violet-500",
    },
  ].filter((s) => s.count > 0);

  const visibleRecs = AI_RECS.filter((r) => !dismissedRecs.includes(r.id));

  const qualifiedPrograms = mockPrograms.filter((prog) =>
    isEligibleForProgram(employee, prog.programType),
  );

  const gridCols =
    qualifiedPrograms.length === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      : qualifiedPrograms.length === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        : qualifiedPrograms.length === 2
          ? "grid-cols-1 sm:grid-cols-2 gap-4"
          : "grid-cols-1 gap-4";

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const serviceAgreement = employee.isNYSNA === true
    ? mockServiceAgreements.find((sa) => sa.employeeId === employee.id) ?? null
    : null;

  const formatDate = (ts: number | string) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const saStatusColors: Record<string, string> = {
    Active:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
    ExpiringSoon:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800",
    Completed: "bg-muted text-muted-foreground border-border",
    Breached:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800",
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Layout title="Overview" breadcrumbs={[{ label: "Overview" }]}>
      <div
        className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto bg-white"
        data-ocid="dashboard.page"
      >
        {/* Greeting */}
        <div className="text-left pt-2 pb-1">
          <h2 className="text-xl font-bold font-display text-slate-800">
            {greeting}, {employee.name.split(" ")[0]}.
          </h2>
        </div>

        {/* Action Needed Card (Inline below greeting) */}
        {hasActionNeeded && (
          <Card className="border-2 border-[#008573] shadow-sm rounded-none bg-white">
            <CardContent className="py-2.5 px-4 flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-[#ebf3ef] text-[#008573] flex items-center justify-center font-bold text-lg shrink-0">
                !
              </div>
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-left">
                  <h3 className="text-xs font-bold text-[#008573] mb-0.5">
                    Action Needed: Service Agreement Required
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    You have 7 days to submit your service agreement for Application MTRA-2026-0041.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/applications")}
                  className="text-[10px] font-bold text-[#008573] hover:underline shrink-0 bg-[#ebf3ef] px-3 py-1.5 rounded-lg border border-[#008573]/20 shadow-sm active:scale-95 transition-all text-center self-start sm:self-auto"
                >
                  Complete Task &gt;
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards Row (Full Width) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tuition Balance (Annual Budget) */}
          <Card className="border border-sky-300 rounded-none bg-white shadow-none h-20 max-h-[80px]">
            <CardContent className="py-3 px-4 flex items-center gap-4 h-full">
              <ProgressRing
                value={employee.tuitionUsed}
                max={employee.tuitionMax}
                size={52}
                strokeWidth={5}
                color="primary"
                valueDisplay={formatCurrency(employee.tuitionBalance)}
                sublabel="left"
                label="Tuition Balance"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="text-sm font-bold text-[#003769] font-body leading-none">
                  Annual Budget
                </div>
                <div className="text-xs font-semibold text-slate-700 font-body leading-tight">
                  Annual Budget: {formatCurrency(employee.tuitionMax)}/year
                </div>
                <div className="text-xs font-medium text-slate-500 font-body leading-none">
                  {formatCurrency(employee.tuitionUsed)} used
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Applications */}
          <Card className="border border-sky-300 rounded-none bg-white shadow-none h-20 max-h-[80px]">
            <CardContent className="py-3 px-4 flex flex-col justify-center h-full">
              <div className="text-sm font-bold text-[#003769] font-body text-left leading-none">
                Active Applications
              </div>
              <div className="mt-2 text-left">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                  <span>Pending Approval: {activeApps.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Reimbursed */}
          <Card className="border border-sky-300 rounded-none bg-white shadow-none h-20 max-h-[80px]">
            <CardContent className="py-3 px-4 flex flex-col justify-center h-full">
              <div className="text-sm font-bold text-[#003769] font-body text-left leading-none">
                Total Reimbursed
              </div>
              <div className="mt-1 text-left flex items-baseline gap-2">
                <span className="text-2xl font-bold font-body text-slate-800 leading-none">
                  {formatCurrency(ytdReimbursed)}
                </span>
                <span className="text-xs font-medium text-slate-500 font-body">
                  Year-to-date: {approvedApps.length} Approved
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications & Updates (2-column layout, 50/50 split) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Recent Applications Card */}
          <Card
            className="border border-border shadow-sm rounded-none bg-white"
            data-ocid="dashboard.applications_section"
          >
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#003769]">
                Recent Applications
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-bold h-6 text-primary p-0"
                onClick={() => router.push("/applications")}
                data-ocid="dashboard.view_all_link"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5 py-3 px-4">
              {myApps.length === 0 ? (
                <div
                  className="text-center py-6 text-xs text-muted-foreground"
                  data-ocid="dashboard.applications_empty_state"
                >
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No applications yet.
                </div>
              ) : (
                myApps.slice(0, 2).map((app, idx) => (
                  <button
                    key={app.id}
                    type="button"
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-none border border-[#008573]/30 hover:bg-muted/35 transition-colors cursor-pointer"
                    onClick={() => router.push(`/applications/${app.id}`)}
                    data-ocid={`dashboard.application.item.${idx + 1}`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">
                        {app.institution}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {app.courseTitle}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
                      <span className="text-xs font-bold text-[#003769]">
                        {formatCurrency(app.amount)}
                      </span>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Application Updates Card */}
          <Card
            className="border border-border shadow-sm rounded-none bg-white"
            data-ocid="dashboard.notifications_section"
          >
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#003769]">
                  Application Updates
                </CardTitle>
                {unreadNotifs.length > 0 && (
                  <Badge
                    className="bg-destructive text-destructive-foreground text-[8px] h-4 px-1 justify-center rounded-none font-bold"
                    data-ocid="dashboard.notifications_unread_badge"
                  >
                    {unreadNotifs.length}
                  </Badge>
                )}
              </div>
              <button
                type="button"
                className="text-[10px] font-bold text-primary hover:underline p-0"
                onClick={() => setMarkedAllRead(true)}
                data-ocid="dashboard.mark_all_read_button"
              >
                Mark all read
              </button>
            </CardHeader>
            <CardContent className="space-y-2.5 py-3 px-4">
              {employeeNotifs.slice(0, 2).map((notif, idx) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-none border border-[#008573]/30 transition-colors ${
                    unreadNotifs.some((n) => n.id === notif.id)
                      ? "bg-primary/5"
                      : "bg-muted/10"
                  }`}
                  data-ocid={`dashboard.notification.item.${idx + 1}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#003769] flex items-center gap-1">
                      {notif.title}
                      {unreadNotifs.some((n) => n.id === notif.id) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {notif.message}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* NYSNA Service Agreement Details Panel (nurses only) */}
        {employee.isNYSNA === true && serviceAgreement && (
          <Card
            className="border border-sky-300 bg-primary/5 shadow-sm rounded-none"
            data-ocid="dashboard.nysna_service_agreement"
          >
            <CardHeader className="py-2.5 px-4 border-b border-primary/15">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
                  <FileSignature className="w-4 h-4 text-primary" />
                  NYSNA Service Agreement Details
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-semibold border rounded-none ${saStatusColors[serviceAgreement.status] ?? ""}`}
                  >
                    {serviceAgreement.status === "ExpiringSoon"
                      ? "Expiring Soon"
                      : serviceAgreement.status}
                  </Badge>
                </CardTitle>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                  NYSNA Article 35
                </span>
              </div>
            </CardHeader>
            <CardContent className="py-2.5 px-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Date Signed
                  </p>
                  <p className="text-xs font-bold text-foreground">
                    {formatDate(serviceAgreement.signedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Valid Until
                  </p>
                  <p className="text-xs font-bold text-foreground">
                    {formatDate(serviceAgreement.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Amount Covered
                  </p>
                  <p className="text-xs font-bold text-foreground">
                    {formatCurrency(serviceAgreement.amount)}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed border-t border-primary/10 pt-2">
                You are required to remain employed at Montefiore Health System for 2 years (or completion of 18 credits) following reimbursement approval per your NYSNA service agreement. Early separation may result in prorated repayment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Available Programs widget list */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#003769] text-left">
            Available Programs:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualifiedPrograms.map((prog) => (
              <Card
                key={prog.id}
                className="border border-[#008573]/20 bg-[#ebf3ef] shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group rounded-none h-[72px]"
                onClick={() => router.push(`/apply?program=${prog.programType}`)}
              >
                <CardContent className="py-2.5 px-4 flex gap-3 items-center h-full">
                  <div className="w-8 h-8 rounded-full bg-[#003769] text-white flex items-center justify-center shrink-0 text-sm">
                    {PROGRAM_ICONS[prog.programType]}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <div className="min-w-0 text-left">
                      <h4 className="text-xs font-bold text-[#003769] group-hover:text-primary transition-colors truncate">
                        {prog.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-normal">
                        {prog.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#008573] hover:underline shrink-0 block text-right">
                      Learn More & Apply &gt;
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default function Home() {
  const { isAuthenticated, hasHydrated } = useAppStore();

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-muted-foreground">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  return <LandingPage />;
}
