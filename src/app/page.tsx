"use client";

import { useApplications } from "@/hooks/useApplications";
import { useEmployeeProfile } from "@/hooks/useEmployees";
import { useNotifications } from "@/hooks/useNotifications";
import { usePrograms } from "@/hooks/usePrograms";

import LandingPage from "@/components/landing/LandingPage";
import { Layout } from "@/components/layout/Layout";
import { AIConfidenceBadge } from "@/components/ui/AIConfidenceBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  mockApplications,
  type mockEmployees,
  mockNotifications,
  mockPrograms,
  mockServiceAgreements,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Brain,
  CalendarCheck2,
  CalendarClock,
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

function isEligibleForProgram(
  employee: (typeof mockEmployees)[number],
  programType: string,
) {
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
  const { currentUser, isAuthenticated, hasHydrated, isChatOpen } =
    useAppStore();
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

  const {
    data: employee,
    isLoading: empLoading,
    error: empError,
  } = useEmployeeProfile();
  const { notifications, markAsRead } = useNotifications();
  const {
    applications: myAppsData,
    isLoading: appsLoading,
    error: appsError,
  } = useApplications();
  const {
    data: programsData,
    isLoading: progsLoading,
    error: progsError,
  } = usePrograms();

  if (
    !hasHydrated ||
    !isAuthenticated ||
    empLoading ||
    appsLoading ||
    progsLoading
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-muted-foreground">
            Loading dashboard data...
          </span>
        </div>
      </div>
    );
  }

  if (empError || appsError || progsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-destructive p-4 text-center">
          <span className="text-sm font-bold">
            Failed to load dashboard data
          </span>
          <span className="text-xs">
            {String(
              (empError || appsError || progsError)?.message || "Unknown error",
            )}
          </span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Employee profile not found.
        </span>
      </div>
    );
  }

  const isNysna = employee.isNYSNA === true;

  const myApps = myAppsData || [];
  const activeApps = myApps.filter(
    (a) => !["Approved", "Rejected"].includes(a.status),
  );
  const approvedApps = myApps.filter((a) => a.status === "Approved");
  const ytdReimbursed = approvedApps.reduce((sum, a) => sum + a.amount, 0);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const hasActionNeeded = notifications.some((n) =>
    n.message.toLowerCase().includes("service agreement"),
  );

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

  const qualifiedPrograms = (programsData || []).filter((prog) =>
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

  const serviceAgreement =
    employee.isNYSNA === true
      ? (mockServiceAgreements.find((sa) => sa.employeeId === employee.id) ??
        null)
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
          <h2 className="text-xl font-bold font-display text-[#003769]">
            {greeting}, {employee.name.split(" ")[0]}.
          </h2>
        </div>

        {/* Top Section: Budget & Active Apps (Left 2 cols) + Action Needed (Right 1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {/* Budget & Active Apps Container */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Annual Budget Card */}
            <Card className="border border-slate-200 rounded-none bg-[#E6F0F5] shadow-none h-full">
              <CardContent className="py-3 px-3 sm:px-4 flex items-center gap-3 h-full">
                <ProgressRing
                  value={employee.tuitionUsed}
                  max={employee.tuitionMax}
                  size={54}
                  strokeWidth={5}
                  color="primary"
                  valueDisplay=""
                  sublabel=""
                  label=""
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-0.5 text-left">
                  <div className="text-sm font-bold text-[#003769] font-body leading-none truncate">
                    Annual Budget
                  </div>
                  <div className="text-xs font-bold text-[#1A1A1A] font-body leading-tight py-0.5 whitespace-nowrap">
                    {formatCurrency(employee.tuitionBalance)} available
                  </div>
                  <div className="text-[10px] font-medium text-[#1A1A1A] font-body leading-none whitespace-nowrap">
                    {formatCurrency(employee.tuitionUsed)} used
                  </div>
                  <div className="text-[10px] font-medium text-[#1A1A1A] font-body leading-tight whitespace-nowrap">
                    Max allowed : {formatCurrency(employee.tuitionMax)}/year
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Applications Card */}
            <Card className="border border-slate-200 rounded-none bg-[#E6F0F5] shadow-none h-full">
              <CardContent className="py-3 px-3 sm:px-4 flex flex-col justify-center h-full text-left">
                <div className="text-sm font-bold text-[#003769] font-body leading-none truncate mb-2">
                  Active Applications
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#1A1A1A] whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008573] shrink-0" />
                  <span>Pending Approval: {activeApps.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Needed Card (Top Right Compact) */}
          <div className="lg:col-span-1">
            <Card className="border border-[#acd3c0] rounded-none bg-[#ebf3ef] shadow-none h-full">
              <CardContent className="py-3 px-4 flex gap-3 items-start h-full">
                <AlertTriangle className="w-6 h-6 text-[#008573] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2 text-left">
                  {myApps.length > 0 ? (
                    <>
                      <div>
                        <h3 className="text-sm font-bold text-[#008573] leading-none mb-1">
                          Action Needed
                        </h3>
                        <div className="text-xs font-bold text-[#003769] mb-1">
                          Service Agreement Required
                        </div>
                        <p className="text-[10px] text-[#1A1A1A] leading-normal line-clamp-2">
                          You have 7 days to submit your service agreement for application {myApps[0].trackingId || myApps[0].id}.
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => router.push("/applications")}
                          className="rounded-full bg-white text-[#003769] hover:bg-slate-100 text-[10px] font-bold px-3.5 py-1 border border-slate-200/80 shadow-xs transition-all text-center cursor-pointer inline-block"
                        >
                          Complete Task
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-sm font-bold text-[#008573] leading-none mb-1">
                          Action Needed
                        </h3>
                        <div className="text-xs font-bold text-[#003769] mb-1">
                          No Pending Tasks
                        </div>
                        <p className="text-[10px] text-[#1A1A1A] leading-normal line-clamp-2">
                          You are up to date! Submit an application to request educational assistance.
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => router.push("/apply")}
                          className="rounded-full bg-white text-[#003769] hover:bg-slate-100 text-[11px] font-bold px-4 py-1.5 border border-slate-200/80 shadow-xs transition-all text-center cursor-pointer inline-block"
                        >
                          Apply Now
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 2-Column Grid: Left Column (Recent Apps & Programs) vs Right Column (Updates & Service Agreement) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Recent Applications Card */}
            <Card
              className="border border-slate-200 shadow-none rounded-none bg-white flex flex-col"
              data-ocid="dashboard.applications_section"
            >
              <CardHeader className="py-2.5 px-4 bg-[#E6F0F5] border-b border-slate-200 rounded-none text-left">
                <CardTitle className="text-sm font-bold text-[#003769]">
                  Recent Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white flex-1 space-y-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push("/applications")}
                    className="text-xs font-bold text-[#003769] hover:text-[#008573] no-underline cursor-pointer transition-colors"
                    data-ocid="dashboard.view_all_link"
                  >
                    View all
                  </button>
                </div>
                {myApps.length === 0 ? (
                  <div className="text-center py-6 px-4 space-y-2">
                    <GraduationCap className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-500">
                      No applications yet.
                    </p>
                  </div>
                ) : (
                  myApps.slice(0, 3).map((app) => (
                    <button
                      key={app.id}
                      onClick={() => router.push(`/applications`)}
                      className="w-full p-3 border border-slate-200 rounded-none bg-white flex items-center justify-between hover:bg-[#E6F0F5]/40 transition-colors text-left cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="text-xs font-bold text-[#008573] font-body truncate">
                          {app.institution}
                        </div>
                        <div className="text-xs text-[#1A1A1A] font-body truncate mt-0.5">
                          {app.courseTitle}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={app.status} size="sm" />
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Available Programs */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#003769] text-left">
                Available Programs:
              </h3>
              {(() => {
                const prog = qualifiedPrograms[0] || {
                  id: "prog-1",
                  name: "Employee Tuition Reimbursement",
                  description:
                    "Reimbursement for accredited degree programs and job-related coursework.",
                  programType: "TuitionReimbursement",
                };
                return (
                  <Card
                    key={prog.id}
                    className="border border-[#acd3c0] bg-[#ebf3ef] shadow-none rounded-none p-4"
                  >
                    <CardContent className="p-0 flex gap-4 items-center">
                      <div className="w-10 h-10 text-[#008573] flex items-center justify-center shrink-0">
                        {PROGRAM_ICONS[prog.programType] ?? (
                          <GraduationCap className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-xs font-bold text-[#008573]">
                          {prog.name}
                        </h4>
                        <p className="text-xs text-[#1A1A1A] mt-0.5 leading-snug">
                          {prog.description}
                        </p>
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/apply?program=${prog.programType}`)
                            }
                            className="rounded-full bg-white text-[#003769] hover:bg-slate-100 text-xs font-bold px-4 py-1.5 border border-slate-200/80 shadow-xs transition-all cursor-pointer inline-block"
                          >
                            Learn More & Apply
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Application Updates Card */}
            <Card
              className="border border-slate-200 shadow-none rounded-none bg-white flex flex-col"
              data-ocid="dashboard.notifications_section"
            >
              <CardHeader className="py-2.5 px-4 bg-[#E6F0F5] border-b border-slate-200 flex flex-row items-center justify-between rounded-none">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold text-[#003769]">
                    Application Updates
                  </CardTitle>
                  <span className="w-5 h-5 rounded-full bg-[#008573] text-white text-xs font-bold flex items-center justify-center">
                    {unreadNotifs.length > 0 ? unreadNotifs.length : 2}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 bg-white flex-1 space-y-3">
                <div className="flex justify-end mb-1">
                  <button
                    type="button"
                    className="text-xs font-bold text-[#003769] hover:text-[#008573] no-underline cursor-pointer transition-colors"
                    onClick={() => setMarkedAllRead(true)}
                    data-ocid="dashboard.mark_all_read_button"
                  >
                    Mark all as read
                  </button>
                </div>
                {notifications.slice(0, 2).map((notif, idx) => (
                  <div
                    key={notif.id}
                    className="p-3 border border-[#acd3c0] bg-[#ebf3ef] rounded-none text-left space-y-1"
                    data-ocid={`dashboard.notification.item.${idx + 1}`}
                  >
                    <div className="text-xs font-bold text-[#008573]">
                      {notif.title || "Notification Update"}
                    </div>
                    <div className="text-xs text-[#1A1A1A] leading-normal">
                      {notif.message}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* NYSNA Service Agreement Details Panel */}
            <Card
              className="border border-slate-200 bg-white shadow-none rounded-none text-left"
              data-ocid="dashboard.nysna_service_agreement"
            >
              <CardHeader className="py-2.5 px-4 bg-[#E6F0F5] border-b border-slate-200">
                <CardTitle className="text-sm font-bold text-[#003769]">
                  NYSNA Service Agreement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs font-bold text-[#008573]">
                      Status
                    </p>
                    <p className="text-xs font-normal text-[#1A1A1A] mt-0.5">
                      Active
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#008573]">
                      Date Signed
                    </p>
                    <p className="text-xs font-normal text-[#1A1A1A] mt-0.5">
                      April 30, 2026
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#008573]">
                      Valid Until
                    </p>
                    <p className="text-xs font-normal text-[#1A1A1A] mt-0.5">
                      April 30, 2027
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-[#1A1A1A] leading-tight mt-2">
                  You are required to remain employed at Montefiore Medical Center for 2 years following reimbursement of 18 credits per your service agreement.
                </p>
              </CardContent>
            </Card>
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
          <span className="text-sm text-muted-foreground">
            Checking authentication...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  return <LandingPage />;
}
