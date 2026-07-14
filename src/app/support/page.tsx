"use client";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";
import { mockApplications, mockEmployees } from "@/data/mockData";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FileText, MessageSquare, Plus, Search } from "lucide-react";
import type { SupportCase } from "@/types";

const CATEGORIES = [
  "Document Issue",
  "Eligibility Question",
  "Payment Query",
  "Service Agreement",
  "Technical Issue",
  "Other",
] as const;

export default function SupportCasesPage() {
  const router = useRouter();
  const { currentUser, supportCases, addSupportCase } = useAppStore();
  const [search, setSearch] = useState("");
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);

  // Form states
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("Document Issue");
  const [linkedAppId, setLinkedAppId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!currentUser) return null;

  // Filter cases by role
  const userRole = currentUser.role;
  let filteredCases = supportCases;

  const currentEmployee = mockEmployees.find((e) => e.employeeId === currentUser?.employeeId) || mockEmployees[0];

  if (userRole === "employee") {
    filteredCases = supportCases.filter(
      (c) => c.employeeId === currentEmployee.id || c.employeeId === currentUser.employeeId
    );
  } else if (userRole === "manager") {
    // Managers see cases raised by reports they supervise
    const reportIds = mockEmployees
      .filter((e) => e.managerId === currentEmployee.id || e.managerId === currentUser.employeeId)
      .flatMap((e) => [e.id, e.employeeId]);
    filteredCases = supportCases.filter((c) => reportIds.includes(c.employeeId));
  } else if (userRole === "hr") {
    // HR Specialists see cases assigned to them or unassigned
    filteredCases = supportCases.filter(
      (c) => c.assignedTo === currentUser.name || c.assignedTo === ""
    );
  }

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase();
    filteredCases = filteredCases.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.employeeName.toLowerCase().includes(q)
    );
  }

  // Get active applications for the employee to link
  const employeeApps = mockApplications.filter(
    (app) => app.employeeId === currentEmployee.id || app.employeeId === currentUser.employeeId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }
    if (description.length > 500) {
      setError("Description cannot exceed 500 characters.");
      return;
    }

    const app = mockApplications.find((a) => a.id === linkedAppId || a.trackingId === linkedAppId);

    const nextIdNum = supportCases.length + 1;
    const formattedId = `SUP-2026-${String(nextIdNum).padStart(4, "0")}`;

    const newCase: SupportCase = {
      id: formattedId,
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      linkedAppId: app?.id ?? app?.trackingId ?? undefined,
      linkedAppProgram: app?.programType ?? undefined,
      linkedAppDate: app?.submittedAt?.split("T")[0] ?? undefined,
      linkedAppStatus: app?.status ?? undefined,
      subject: subject.trim(),
      category: category,
      description: description.trim(),
      status: "Open",
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      assignedTo: "Priya Nair", // Auto-assign to default HR Benefits specialist
      reopenedFlag: false,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: currentUser.name,
          senderRole: "employee",
          message: description.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    };

    addSupportCase(newCase);
    setIsNewCaseOpen(false);
    // Reset form
    setSubject("");
    setCategory("Document Issue");
    setLinkedAppId("");
    setDescription("");
    setError("");
  };

  const getStatusStyle = (status: string) => {
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Layout
      title="Support Tickets"
      breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Support Cases" }]}
    >
      <div className="p-4 space-y-6 max-w-6xl mx-auto min-h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">
              Internal Support Helpdesk
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 font-body">
              Submit support tickets and track query resolutions linked to your tuition requests.
            </p>
          </div>

          {userRole === "employee" && (
            <Button
              onClick={() => setIsNewCaseOpen(true)}
              className="bg-[#008573] hover:bg-[#006e5f] text-white gap-2 font-body text-xs font-semibold h-9 rounded-md shrink-0"
            >
              <Plus className="w-4 h-4" /> Raise a support case
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="border-border shadow-sm">
          <CardHeader className="p-0">
            <div className="px-6 py-4 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets by ID, subject, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCases.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <p className="text-sm font-bold text-foreground">No support cases yet.</p>
                  <p className="text-xs text-muted-foreground font-body">
                    If you have a question or issue about your application, raise a support case to get assistance from HR.
                  </p>
                </div>
                {userRole === "employee" && (
                  <Button
                    onClick={() => setIsNewCaseOpen(true)}
                    className="bg-[#008573] hover:bg-[#006e5f] text-white text-xs font-semibold h-8 rounded-md"
                  >
                    Raise a support case
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/40 border-b border-border">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11 w-28">
                        Case ID
                      </TableHead>
                      {userRole !== "employee" && (
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11">
                          Employee
                        </TableHead>
                      )}
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11">
                        Subject
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11">
                        Category
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11">
                        Linked Request
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11 w-28">
                        Status
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11">
                        Created Date
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11 text-right pr-6 w-24">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.map((c) => (
                      <TableRow
                        key={c.id}
                        className="hover:bg-muted/30 border-b border-border/40 transition-colors cursor-pointer"
                        onClick={() => router.push(`/support/${c.id}`)}
                      >
                        <TableCell className="font-mono text-xs font-bold text-foreground py-3">
                          {c.id}
                        </TableCell>
                        {userRole !== "employee" && (
                          <TableCell className="text-xs font-semibold py-3 text-foreground">
                            {c.employeeName}
                          </TableCell>
                        )}
                        <TableCell className="text-xs font-bold text-slate-800 py-3 truncate max-w-xs">
                          {c.subject}
                        </TableCell>
                        <TableCell className="text-xs py-3 font-medium text-slate-600">
                          {c.category}
                        </TableCell>
                        <TableCell className="text-xs py-3 text-slate-500 font-mono">
                          {c.linkedAppId ? c.linkedAppId : "None"}
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className={`border text-[9px] font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider ${getStatusStyle(
                              c.status
                            )}`}
                          >
                            {c.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs py-3 text-muted-foreground">
                          {formatDate(c.createdDate)}
                        </TableCell>
                        <TableCell className="text-right pr-6 py-3" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/support/${c.id}`)}
                            className="h-7 text-[10px] font-semibold border-[#008573]/20 text-[#008573] hover:bg-[#008573]/5"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raise Support Case Modal Dialog */}
      {isNewCaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-foreground">
                Raise a Support Case
              </h3>
              <button
                onClick={() => setIsNewCaseOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 font-body">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs font-bold text-foreground">
                  Case Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="e.g. Upload timeout on transcript file"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold text-foreground">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(val) => setCategory(val as typeof CATEGORIES[number])}
                  >
                    <SelectTrigger id="category" className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-xs">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="linkedApp" className="text-xs font-bold text-foreground">
                    Linked Application
                  </Label>
                  <Select value={linkedAppId} onValueChange={setLinkedAppId}>
                    <SelectTrigger id="linkedApp" className="h-9 text-xs">
                      <SelectValue placeholder="Select application..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">
                        None / General Query
                      </SelectItem>
                      {employeeApps.map((app) => (
                        <SelectItem key={app.id} value={app.id} className="text-xs">
                          {app.trackingId} - {app.programType.replace("Reimbursement", "")} ({formatDate(app.submittedAt || app.createdAt)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="desc" className="text-xs font-bold text-foreground">
                    Case Description <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {description.length} / 500 chars
                  </span>
                </div>
                <textarea
                  id="desc"
                  rows={4}
                  maxLength={500}
                  placeholder="Describe your issue in detail. If this relates to a document block, please specify details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="file" className="text-xs font-bold text-foreground">
                  Attachment <span className="text-muted-foreground font-normal">(optional, Max 5MB)</span>
                </Label>
                <div className="border border-dashed border-input rounded-md p-3 flex items-center justify-between bg-muted/20">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> No file chosen
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-7 text-[10px] font-semibold border-primary/20 text-primary hover:bg-primary/5 px-3"
                  >
                    Select File
                  </Button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewCaseOpen(false)}
                  className="h-9 text-xs font-semibold px-4 rounded-md font-body"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs font-semibold px-5 rounded-md bg-[#008573] hover:bg-[#006e5f] text-white font-body"
                >
                  Submit Case
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
