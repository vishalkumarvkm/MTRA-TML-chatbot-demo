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
import { use } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
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
  Zap,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Find case data
  const caseData = mockCaseItems.find((c) => c.id === id) || mockCaseItems[0];
  const employee = mockEmployees.find((e) => e.id === caseData.employeeId) || mockEmployees[0];

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
        { label: "Dashboard", href: "/dashboard" },
        { label: "HR Operations", href: "/hr-ops" },
        { label: caseData.id },
      ]}
    >
      <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-muted/20">
        {/* Left Sidebar: Employee Profile */}
        <aside className="w-full lg:w-72 bg-card border-r border-border overflow-y-auto flex-shrink-0 h-[40vh] lg:h-full">
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <Avatar className="w-20 h-20 border-2 border-primary/10 shadow-sm">
                <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                  {employee.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-foreground leading-tight">{employee.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{employee.title}</p>
                <Badge variant="outline" className="mt-2 text-[10px] font-mono border-primary/20 text-primary">
                  {employee.employeeId}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
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
                <p className="text-xs font-medium text-primary hover:underline cursor-pointer truncate">{employee.email}</p>
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
                <p className="text-xs font-medium text-primary hover:underline cursor-pointer">Dr. James Okonkwo</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Benefit Balances</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Tuition
                  </span>
                  <span className="font-bold">{formatCurrency(employee.tuitionBalance)} <span className="text-[10px] text-muted-foreground font-normal">/ $5,000</span></span>
                </div>
                <Progress value={(employee.tuitionUsed / employee.tuitionMax) * 100} className="h-1 bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Credits
                  </span>
                  <span className="font-bold">{employee.creditBalance} <span className="text-[10px] text-muted-foreground font-normal">remaining of 18</span></span>
                </div>
                <Progress value={(employee.creditUsed / employee.creditMax) * 100} className="h-1 bg-muted" />
              </div>
            </div>

            <Button variant="outline" className="w-full text-xs h-9 border-primary/20 text-primary hover:bg-primary/5">
              View Full Profile
            </Button>
          </div>
        </aside>

        {/* Main Case Content */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Case Header */}
          <header className="bg-card border-b border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
             <div className="flex items-center gap-4 min-w-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => router.back()}>
                   <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="min-w-0">
                   <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={caseData.status} size="sm" />
                      <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/5 text-emerald-600 border-emerald-500/20">On Track</Badge>
                      <AIConfidenceBadge confidence={caseData.aiConfidence} size="sm" />
                      <Badge variant="outline" className="text-[10px] h-5 bg-amber-500/5 text-amber-600 border-amber-500/20">Medium</Badge>
                   </div>
                   <h1 className="text-sm font-bold text-foreground truncate">Case {caseData.id} • {caseData.employeeName}</h1>
                </div>
             </div>
             <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <Button size="sm" className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                   <CheckCircle2 className="w-4 h-4" /> Approve
                </Button>
                <Button variant="outline" size="sm" className="h-9 px-4 text-destructive border-destructive/20 hover:bg-destructive/5 gap-2">
                   <Zap className="w-4 h-4 rotate-180" /> Reject
                </Button>
                <Button variant="outline" size="sm" className="h-9 px-4 text-amber-600 border-amber-500/20 hover:bg-amber-500/5 gap-2">
                   <ShieldAlert className="w-4 h-4" /> Escalate
                </Button>
                <Button variant="outline" size="sm" className="h-9 px-4 gap-2">
                   <MessageSquare className="w-4 h-4" /> Request Info
                </Button>
             </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 space-y-6">
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
                               <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/5 text-emerald-600 border-emerald-500/20">On Track</Badge>
                            </div>
                            <h2 className="text-lg font-bold text-foreground leading-tight">Health Informatics & Data Analytics (HIT 520)</h2>
                            <p className="text-xs text-muted-foreground mt-1">Fordham University • Spring 2026</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-2xl font-bold text-foreground">$2,400</div>
                         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">9 credits</p>
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
                            <User className="w-3 h-3" /> Assigned HR
                         </p>
                         <p className="text-xs font-bold italic">{caseData.assignedHR}</p>
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
                      Timeline
                   </TabsTrigger>
                   <TabsTrigger 
                      value="documents" 
                      className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all gap-2"
                   >
                      Documents <span className="bg-brand-teal text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center">3</span>
                   </TabsTrigger>
                   <TabsTrigger 
                      value="notes" 
                      className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all gap-2"
                   >
                      Notes <span className="bg-brand-teal text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center">3</span>
                   </TabsTrigger>
                   <TabsTrigger 
                      value="audit" 
                      className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all gap-2"
                   >
                      Audit <span className="bg-brand-teal text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center">3</span>
                   </TabsTrigger>
                </TabsList>
                <TabsContent value="timeline" className="pt-0">
                   <Card className="border-border shadow-sm">
                      <CardHeader className="pb-2">
                         <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Application Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-8 pt-4 relative pb-10">
                         {/* Timeline Line */}
                         <div className="absolute left-[2.4rem] top-10 bottom-10 w-0.5 bg-border z-0" />

                         {[
                           {
                             title: "Application Submitted",
                             desc: "Employee submitted via HealthyME portal. Tracking ID: MTRA-2026-0041",
                             time: "Apr 15, 2026 • 10:23 am",
                             done: true,
                           },
                           {
                             title: "Under Review",
                             desc: "Auto-assigned to Priya Nair. HealthyME AI Analysis document processing completed (avg 95.8% confidence)",
                             time: "Apr 15, 2026 • 11:30 am",
                             done: true,
                           },
                           {
                             title: "HR Analysis",
                             desc: "Eligibility confirmed. Transcript flagged for manual OCR review. Manager notified.",
                             time: "Apr 16, 2026 • 9:15 am",
                             done: true,
                           },
                           {
                             title: "Pending Manager Approval",
                             desc: "Awaiting Dr. James Okonkwo's formal approval. SLA: 28 of 45 days elapsed.",
                             time: "Today • Current",
                             current: true,
                           },
                           {
                             title: "Payroll Processing",
                             desc: "Workday sync + IRS §127 split calculation + GL code assignment",
                             pending: true,
                           },
                           {
                             title: "Complete",
                             desc: "Reimbursement posted to payroll. Service agreement tracked.",
                             pending: true,
                           },
                         ].map((item, idx) => (
                           <div key={idx} className="flex gap-6 relative z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${item.done ? "bg-primary text-white border-primary" : item.current ? "bg-white text-primary border-primary" : "bg-muted text-muted-foreground border-border"}`}>
                                 {item.done ? <CheckCircle2 className="w-4 h-4" /> : item.current ? <div className="w-2 h-2 rounded-full bg-primary" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                              </div>
                              <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`text-xs font-bold ${item.pending ? "text-muted-foreground" : "text-foreground"}`}>{item.title}</h3>
                                    {item.current && <Badge className="bg-primary/10 text-primary text-[9px] h-4 px-1.5 border-transparent">Current</Badge>}
                                 </div>
                                 <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl">{item.desc}</p>
                                 {item.time && <p className="text-[10px] text-muted-foreground/60 mt-1">{item.time}</p>}
                              </div>
                           </div>
                         ))}
                      </CardContent>
                   </Card>
                </TabsContent>
                <TabsContent value="documents" className="pt-0">
                   <Card className="border-border shadow-sm">
                      <CardHeader className="pb-2">
                         <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Uploaded Documents</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                         {[
                           { name: "Enrollment_Spring2026.pdf", type: "Enrollment", size: "245 KB", date: "Apr 15, 2026", status: "Verified", confidence: 97 },
                           { name: "Tuition_Receipt_Spring2026.pdf", type: "Receipt", size: "178 KB", date: "Apr 15, 2026", status: "Verified", confidence: 94 },
                           { name: "Official_Transcript_Fall2025.pdf", type: "Transcript", size: "512 KB", date: "Apr 15, 2026", status: "Pending Review", confidence: 73, alert: true },
                         ].map((doc, idx) => (
                           <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-all group">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-white group-hover:text-primary transition-colors">
                                    <FileText className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className="text-xs font-bold text-foreground">{doc.name}</span>
                                       <Badge variant="outline" className={`text-[9px] h-5 px-1.5 ${doc.alert ? "bg-violet-50 text-violet-600 border-violet-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
                                          {doc.status}
                                       </Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{doc.type} • {doc.size} • {doc.date}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                                    <Brain className={`w-3.5 h-3.5 ${doc.confidence > 90 ? "text-emerald-500" : "text-amber-500"}`} />
                                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                                       <div className={`h-full ${doc.confidence > 90 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${doc.confidence}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-foreground">{doc.confidence}%</span>
                                 </div>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white">
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
                         <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notes & Comments</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-4">
                         {[
                           { 
                             name: "Priya Nair", 
                             role: "HR Specialist", 
                             time: "Apr 16, 2026, 2:45 pm", 
                             initials: "PN",
                             color: "blue",
                             text: "Reviewed all submitted documents. Enrollment confirmed with CUNY Lehman registrar. Receipt matches tuition schedule. Transcript still in pending state — AI OCR flagged for manual review. Forwarding to manager for approval once transcript is cleared." 
                           },
                           { 
                             name: "Dr. James Okonkwo", 
                             role: "Nurse Manager", 
                             time: "Apr 17, 2026, 8:00 pm", 
                             initials: "DJ",
                             color: "emerald",
                             text: "Maria is an outstanding team member and this course directly supports her role as charge nurse. I fully support this application. Pending HR clearance of transcript." 
                           },
                           { 
                             name: "Priya Nair", 
                             role: "HR Specialist", 
                             time: "Apr 22, 2026, 4:30 pm", 
                             initials: "PN",
                             color: "blue",
                             text: "Transcript re-submitted for AI reprocessing. OCR confidence improved to 73%. Manual verification in progress. SLA clock at 7 days. Expected resolution by Apr 29." 
                           },
                         ].map((note, idx) => (
                           <div key={idx} className="space-y-2">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                       <AvatarFallback className={`bg-${note.color}-500/10 text-${note.color}-600 text-[10px] font-bold`}>{note.initials}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-bold text-foreground">{note.name}</span>
                                    <Badge variant="outline" className="text-[9px] h-4 px-1 bg-muted/50 text-muted-foreground border-transparent">{note.role}</Badge>
                                 </div>
                                 <span className="text-[9px] text-muted-foreground">{note.time}</span>
                              </div>
                              <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                                 <p className="text-[11px] text-foreground leading-relaxed">{note.text}</p>
                              </div>
                           </div>
                         ))}

                         <div className="pt-4 space-y-3">
                            <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Add Comment</p>
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
                <TabsContent value="audit" className="pt-0">
                   <Card className="border-border shadow-sm">
                      <CardHeader className="pb-2">
                         <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Audit History</CardTitle>
                      </CardHeader>
                       <CardContent className="pt-4 px-0 pb-0">
                          <div className="overflow-x-auto">
                             <Table>
                            <TableHeader>
                               <TableRow className="hover:bg-transparent bg-muted/30 border-b border-border">
                                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-10 px-6">Action</TableHead>
                                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-10 px-6">Performed By</TableHead>
                                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-10 px-6">Timestamp</TableHead>
                                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-10 px-6">Details</TableHead>
                               </TableRow>
                            </TableHeader>
                            <TableBody>
                               {[
                                 { action: "APPLICATION_SUBMITTED", actor: "Latasha Williams", role: "employee", time: "Apr 20, 2026, 1:46 pm", details: "Employee submitted tuition reimbursement application MTRA-2026-0047 for Fordham University." },
                                 { action: "AI_LOW_CONFIDENCE", actor: "HealthyME AI Agent", role: "admin", time: "Apr 20, 2026, 1:50 pm", details: "Fordham University invoice processing flagged — confidence 78%. Document queued for manual review." },
                                 { action: "DOCUMENT_REPROCESSED", actor: "Priya Nair", role: "hr", time: "Apr 21, 2026, 3:30 pm", details: "HR manually re-submitted Fordham invoice for AI reprocessing due to low confidence score." },
                               ].map((entry, idx) => (
                                 <TableRow key={idx} className="border-b border-border/50 hover:bg-muted/20">
                                    <TableCell className="px-6">
                                       <Badge variant="outline" className="text-[9px] font-mono bg-muted/50 border-border/50 text-foreground">
                                          {entry.action}
                                       </Badge>
                                    </TableCell>
                                    <TableCell className="px-6">
                                       <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-foreground">{entry.actor}</span>
                                          <Badge variant="outline" className="text-[8px] h-4 px-1 bg-primary/5 text-primary border-primary/20">
                                             {entry.role}
                                          </Badge>
                                       </div>
                                    </TableCell>
                                    <TableCell className="px-6 text-[10px] text-muted-foreground whitespace-nowrap">{entry.time}</TableCell>
                                    <TableCell className="px-6 text-[10px] text-muted-foreground leading-relaxed">{entry.details}</TableCell>
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

        {/* Right Sidebar: AI & Compliance */}
        <aside className="w-full lg:w-80 bg-card border-l border-border overflow-y-auto flex-shrink-0 h-[40vh] lg:h-full">
          <div className="p-6 space-y-6">
             <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden shadow-sm">
                <CardHeader className="p-4 border-b border-emerald-500/10">
                   <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-emerald-700">HealthyME AI Analysis</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                   <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                         <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Automated eligibility check</p>
                         <Progress value={78} className="h-1 bg-emerald-100 dark:bg-emerald-950/40" />
                      </div>
                      <div className="text-lg font-bold text-emerald-700">78%</div>
                   </div>

                   <Badge className="w-full justify-center bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] h-7 gap-2">
                      Medium Confidence <span className="font-bold">78%</span>
                   </Badge>

                   <div className="space-y-3 pt-2">
                      {[
                        { text: "Employment duration: 3.2 yrs (min 1 yr met)", ok: true },
                        { text: "FTE status: 1.0 full-time (eligibility met)", ok: true },
                        { text: "Tuition amount: $2,400 within IRS §127 limit", ok: true },
                        { text: "Enrollment document: OCR verified (97%)", ok: true },
                        { text: "Receipt: Amount & Institution match (94%)", ok: true },
                        { text: "Transcript: Flagged for manual review (78%)", alert: true },
                      ].map((check, i) => (
                        <div key={i} className="flex items-start gap-2">
                           {check.alert ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />}
                           <p className="text-[10px] text-muted-foreground leading-tight">{check.text}</p>
                        </div>
                      ))}
                   </div>

                   <div className="p-3 bg-white rounded-lg border border-emerald-500/10 space-y-2 shadow-sm">
                      <p className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                         <Brain className="w-3 h-3" /> AI Recommendation
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                         2 of 3 documents fully verified. Flagging for manual review of transcript OCR result. Employment, amount, and FTE criteria all confirmed. <span className="font-bold text-foreground">Recommend approval pending transcript confirmation.</span>
                      </p>
                   </div>
                </CardContent>
             </Card>

             <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                   <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Approval Chain</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                   {[
                     { name: "Maria Santos", role: "Employee", status: "submitted", color: "emerald" },
                     { name: "Priya Nair", role: "HR Officer", status: "active", color: "blue" },
                     { name: "Dr. James Okonkwo", role: "Manager", status: "pending", color: "muted" },
                     { name: "Payroll Dept", role: "Payroll", status: "pending", color: "muted" },
                   ].map((p, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                           <AvatarFallback className={`bg-${p.color}-500/10 text-${p.color}-600 text-[10px] font-bold uppercase`}>{p.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                           <p className="text-[11px] font-bold text-foreground leading-tight">{p.name}</p>
                           <p className="text-[10px] text-muted-foreground">{p.role}</p>
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'submitted' ? 'bg-emerald-500' : p.status === 'active' ? 'bg-blue-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                     </div>
                   ))}
                </CardContent>
             </Card>

             <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                   <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                   <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                         <span className="flex items-center gap-1.5 text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> NYSNA 45-day SLA</span>
                         <span className="text-emerald-600">17/45 days</span>
                      </div>
                      <Progress value={37} className="h-1 bg-muted" />
                      <p className="text-[9px] text-muted-foreground">28 days remaining</p>
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                         <span className="flex items-center gap-1.5 text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> IRS §127 Status</span>
                         <span className="text-emerald-600">$2,400 / $5,250</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-tight">$2,400 / $5,250 annual limit. Tax-free threshold met.</p>
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                         <span className="flex items-center gap-1.5 text-foreground"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" /> Payroll Posting</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-tight italic">Pending approval, GL code: 61200-TUIT</p>
                   </div>
                </CardContent>
             </Card>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
