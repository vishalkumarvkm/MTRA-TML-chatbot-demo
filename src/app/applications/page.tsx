"use client";

import { Layout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  mockApplications,
  mockEmployees,
  mockPrograms,
  mockServiceAgreements,
} from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import {
  CalendarCheck2,
  ChevronRight,
  Download,
  FileSignature,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApplicationsPage() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const [search, setSearch] = useState("");

  // Current employee (Maria Santos in demo)
  const currentEmployee =
    mockEmployees.find((e) => e.employeeId === currentUser?.employeeId) ||
    mockEmployees[0];
  const isNYSNA = currentEmployee.isNYSNA === true;

  // Find this employee's active service agreement (NYSNA only)
  const serviceAgreement = isNYSNA
    ? (mockServiceAgreements.find(
        (sa) => sa.employeeId === currentEmployee.id,
      ) ?? null)
    : null;

  let userApps = mockApplications;
  if (currentUser?.role === "employee") {
    userApps = mockApplications.filter(
      (app) => app.employeeId === currentEmployee.id,
    );
  }

  const filteredApps = userApps.filter(
    (app) =>
      app.institution.toLowerCase().includes(search.toLowerCase()) ||
      app.courseTitle?.toLowerCase().includes(search.toLowerCase()) ||
      app.id.toLowerCase().includes(search.toLowerCase()),
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

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

  return (
    <Layout
      title="My Applications"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Applications" },
      ]}
    >
      <div
        className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto"
        data-ocid="applications.page"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display text-foreground">
              My Applications
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your reimbursement requests.
            </p>
          </div>
          <Button
            onClick={() => router.push("/apply")}
            className="gap-2 w-full sm:w-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Application
          </Button>
        </div>

        {/* NYSNA Service Agreement Panel (NYSNA nurses only) */}
        {isNYSNA && serviceAgreement && (
          <Card
            className="border-primary/25 bg-primary/5 shadow-sm"
            data-ocid="applications.nysna_service_agreement"
          >
            <CardHeader className="pb-3 border-b border-primary/15">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <FileSignature className="w-4 h-4 text-primary" />
                  NYSNA Service Agreement
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold border ${saStatusColors[serviceAgreement.status] ?? ""}`}
                  >
                    {serviceAgreement.status === "ExpiringSoon"
                      ? "Expiring Soon"
                      : serviceAgreement.status}
                  </Badge>
                </CardTitle>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  NYSNA Article 35
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {/* Signed Date */}
                <div className="flex items-start gap-2.5">
                  <CalendarCheck2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Date Signed
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {formatDate(serviceAgreement.signedDate)}
                    </p>
                  </div>
                </div>

                {/* Valid Until */}
                <div className="flex items-start gap-2.5">
                  <CalendarCheck2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Valid Until
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {formatDate(serviceAgreement.endDate)}
                    </p>
                  </div>
                </div>

                {/* Amount Covered */}
                <div className="flex items-start gap-2.5 col-span-2 sm:col-span-1">
                  <FileSignature className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Amount Covered
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {formatCurrency(serviceAgreement.amount)}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed border-t border-primary/10 pt-3">
                You are required to remain employed at Montefiore Health System
                for 2 years (or completion of 18 credits) following
                reimbursement approval per your NYSNA service agreement. Early
                separation may result in prorated repayment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Applications Table */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border bg-muted/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-background"
                  data-ocid="applications.search_input"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 whitespace-nowrap"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Sort
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/50">
                    <TableHead className="w-[120px] font-semibold">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold">Details</TableHead>
                    <TableHead className="font-semibold">Program</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Submitted</TableHead>
                    <TableHead className="font-semibold text-center">
                      Status
                    </TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-64 text-center text-muted-foreground"
                      >
                        No applications found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApps.map((app, idx) => (
                      <TableRow
                        key={app.id}
                        className="cursor-pointer group"
                        onClick={() => router.push(`/applications/${app.id}`)}
                        data-ocid={`applications.row.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-[10px] font-semibold text-muted-foreground">
                          {app.id}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {app.institution}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {app.courseTitle}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium whitespace-nowrap"
                          >
                            {mockPrograms.find(
                              (p) => p.programType === app.programType,
                            )?.name ?? app.programType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {formatCurrency(app.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(app.submittedAt ?? app.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={app.status} />
                        </TableCell>
                        <TableCell className="text-right px-4">
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden divide-y divide-border">
              {filteredApps.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No applications found.
                </div>
              ) : (
                filteredApps.map((app, idx) => (
                  <div
                    key={app.id}
                    className="p-4 active:bg-muted transition-colors flex flex-col gap-3"
                    onClick={() => router.push(`/applications/${app.id}`)}
                    data-ocid={`applications.card.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            {app.id}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            â€¢ {formatDate(app.submittedAt ?? app.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-bold text-foreground text-sm line-clamp-1">
                          {app.institution}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {app.courseTitle}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Badge
                        variant="outline"
                        className="text-[9px] font-medium bg-muted/30"
                      >
                        {mockPrograms.find(
                          (p) => p.programType === app.programType,
                        )?.name ?? app.programType}
                      </Badge>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground">
                          {formatCurrency(app.amount)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
