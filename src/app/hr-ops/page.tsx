"use client";

import { Layout as HROpsLayout } from "@/components/layout/Layout";
import { AIConfidenceBadge } from "@/components/ui/AIConfidenceBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCaseItems } from "@/data/mockData";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Info,
  LayoutDashboard,
  MessageSquare,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  Users,
  Zap,
  TrendingDown,
  FileText,
} from "lucide-react";
import { useState } from "react";

const AGENT_ACTIVITY = [
  {
    id: 1,
    type: "ai",
    text: "AI processed TR-2025-001 - 94% confidence",
    sub: "MTRA-2026-0041 | Maria Santos",
    time: "2m ago",
    icon: <Brain className="w-3.5 h-3.5 text-primary" />,
  },
  {
    id: 2,
    type: "doc",
    text: "Document OCR completed for Maria Santos",
    sub: "Enrollment_Spring2026.pdf verified",
    time: "5m ago",
    icon: <FileText className="w-3.5 h-3.5 text-emerald-500" />,
  },
  {
    id: 3,
    type: "sla",
    text: "SLA threshold triggered - case-003",
    sub: "Carlos Rivera | Overdue by 13 days",
    time: "12m ago",
    icon: <ShieldAlert className="w-3.5 h-3.5 text-destructive" />,
  },
  {
    id: 4,
    type: "check",
    text: "Eligibility check passed for Aisha Thompson",
    sub: "TuitionReimbursement | Columbia Univ.",
    time: "28m ago",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  },
  {
    id: 5,
    type: "ai",
    text: "AI flagged low-confidence - case-007",
    sub: "Fordham Invoice - 71% confidence",
    time: "35m ago",
    icon: <Brain className="w-3.5 h-3.5 text-amber-500" />,
  },
  {
    id: 6,
    type: "gen",
    text: "Service agreement generated for case-001",
    sub: "Auto-signed workflow initiated",
    time: "1h ago",
    icon: <FileText className="w-3.5 h-3.5 text-primary" />,
  },
  {
    id: 7,
    type: "user",
    text: "Case auto-assigned to Priya Nair",
    sub: "MTRA-2026-0047 | Latasha Williams",
    time: "1h ago",
    icon: <Users className="w-3.5 h-3.5 text-muted-foreground" />,
  },
];

export default function HROpsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCases = mockCaseItems.filter(
    (c) =>
      c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.assignedHR.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <HROpsLayout
      title="HR Operations Center"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "HR Operations" },
      ]}
    >
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto bg-muted/20 min-h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">HR Operations Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">NYSNA compliance | Case queue | SLA monitoring | AI Insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm"><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
            <Button size="sm" className="h-9 gap-2 bg-primary shadow-sm"><Download className="w-3.5 h-3.5" /> Export</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "TOTAL ACTIVE CASES", value: "7", sub: "+ 2 since last week", icon: LayoutDashboard, trend: "up" },
            { label: "PENDING APPROVALS", value: "2", sub: "No change", icon: Users, trend: "neutral" },
            { label: "SLA AT RISK", value: "3", badge: "URGENT", sub: "3 cases breach window", icon: AlertCircle, alert: true },
            { label: "AVG PROCESSING TIME", value: "7.4d", sub: "0.8d Improvement", icon: TrendingDown, success: true },
          ].map((stat, i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-1.5 rounded-lg ${stat.alert ? "bg-destructive/10 text-destructive" : stat.success ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold font-display">{stat.value}</span>
                  {stat.badge && <Badge variant="destructive" className="text-[9px] h-4 px-1 font-bold bg-destructive/10 text-destructive border-transparent">{stat.badge}</Badge>}
                </div>
                <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* NYSNA Tracker */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">NYSNA Compliance Tracker</CardTitle>
                <p className="text-[10px] text-muted-foreground">Article 35 - 45-Day Processing Requirement</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground px-0.5">
                    <span>Current oldest open case</span>
                    <span className="text-amber-600">Day 38 of 45</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden relative shadow-inner">
                    <div className="h-full bg-brand-teal w-[84%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Carlos Rivera", sub: "St. John's University", status: "Overdue", time: "14d overdue", alert: true },
                    { name: "Latasha Williams", sub: "CUNY Bronx CC", status: "At Risk", time: "2d left" },
                  ].map((c, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${c.alert ? "bg-destructive/5 border-destructive/20" : "bg-amber-500/5 border-amber-500/20 shadow-sm"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.alert ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"}`}><AlertTriangle className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs font-bold">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.sub}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold">{c.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Escalated Cases */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 px-1">
                  <Zap className="w-4 h-4 text-destructive" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Escalated / Exception Cases</h2>
                  <Badge className="bg-destructive/10 text-destructive text-[9px] h-4 font-bold border-transparent">2 Active</Badge>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                     <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                              <p className="text-xs font-bold">Carlos Rivera</p>
                           </div>
                           <p className="text-xs font-bold">$3,250</p>
                        </div>
                        <div className="bg-destructive/5 text-[10px] text-destructive p-3 rounded-lg border border-destructive/10 font-medium leading-relaxed">
                           Service agreement not completed - NYSNA 45-day window exceeded
                        </div>
                        <div className="flex gap-1.5 justify-end">
                           <Button variant="outline" size="sm" className="h-7 text-[10px] px-3 font-bold">Open Case</Button>
                           <Button size="sm" className="h-7 text-[10px] px-3 font-bold bg-destructive text-white">Resolve</Button>
                        </div>
                     </CardContent>
                  </Card>
                  <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                     <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                              <p className="text-xs font-bold">Latasha Williams</p>
                           </div>
                           <p className="text-xs font-bold">$1,600</p>
                        </div>
                        <div className="bg-amber-500/5 text-[10px] text-amber-700 p-3 rounded-lg border border-amber-500/10 font-medium leading-relaxed">
                           Low AI confidence (71%) - Invoice requires manual document review
                        </div>
                        <div className="flex gap-1.5 justify-end">
                           <Button variant="outline" size="sm" className="h-7 text-[10px] px-3 font-bold">Open Case</Button>
                           <Button size="sm" className="h-7 text-[10px] px-3 font-bold bg-amber-500 text-white">Resolve</Button>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>

            {/* Case Queue Table Section */}
            <Card className="border-border shadow-sm overflow-hidden bg-card">
              <CardHeader className="p-0 border-b border-border">
                 <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Tabs defaultValue="all" className="w-auto">
                       <TabsList className="bg-brand-lightblue p-1 h-auto rounded-lg gap-1 border-none">
                          <TabsTrigger value="all" className="text-[10px] font-bold px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">All Cases <span className="ml-1 px-1.5 rounded-full bg-muted text-muted-foreground">10</span></TabsTrigger>
                          <TabsTrigger value="high" className="text-[10px] font-bold px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">High Priority <span className="ml-1 px-1.5 rounded-full bg-destructive/10 text-destructive">4</span></TabsTrigger>
                          <TabsTrigger value="pending" className="text-[10px] font-bold px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Pending Review <span className="ml-1 px-1.5 rounded-full bg-amber-100 text-amber-700">3</span></TabsTrigger>
                       </TabsList>
                    </Tabs>
                 </div>
                 <div className="px-6 py-4 bg-muted/10 border-t border-border flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                       <Input 
                          placeholder="Search cases..." 
                          className="h-10 pl-9 text-xs bg-background shadow-sm border-border/60 focus:border-primary/50"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                       />
                    </div>
                    <div className="flex items-center gap-2">
                       <Select defaultValue="all">
                          <SelectTrigger className="h-10 text-xs w-[130px] bg-background shadow-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                          <SelectContent><SelectItem value="all">All Statuses</SelectItem></SelectContent>
                       </Select>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <Table>
                       <TableHeader>
                          <TableRow className="hover:bg-transparent bg-muted/40 border-b border-border">
                             <TableHead className="w-[50px] px-6"><input type="checkbox" className="rounded border-border" /></TableHead>
                             <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11">Employee</TableHead>
                             <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11">Program</TableHead>
                             <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11">Amount</TableHead>
                             <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11">Status</TableHead>
                             <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11 text-right pr-6">Actions</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {filteredCases.map((c, idx) => (
                            <TableRow key={c.id} className="hover:bg-muted/30 transition-all border-b border-border/40 group cursor-pointer" onClick={() => router.push(`/cases/${c.id}`)}>
                               <TableCell className="px-6"><input type="checkbox" className="rounded border-border" onClick={(e) => e.stopPropagation()} /></TableCell>
                               <TableCell>
                                  <div className="flex flex-col py-1">
                                     <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{c.employeeName}</span>
                                     <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">{c.id}</span>
                                  </div>
                               </TableCell>
                               <TableCell>
                                  <Badge variant="outline" className="text-[9px] font-bold bg-muted/30 h-5 px-2 border-transparent">
                                     {c.programType === "TuitionReimbursement" ? "Tuition" : "Other"}
                                  </Badge>
                               </TableCell>
                               <TableCell className="text-xs font-bold">${c.amount.toLocaleString()}</TableCell>
                               <TableCell><StatusBadge status={c.status} size="sm" /></TableCell>
                               <TableCell className="text-right pr-6">
                                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold px-3 hover:bg-primary/10 hover:text-primary transition-all">Review</Button>
                               </TableCell>
                            </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </div>
                 <div className="px-6 py-4 border-t border-border bg-muted/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Showing 10 of 124 cases</span>
                    <div className="flex items-center gap-2">
                       <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold px-4 shadow-sm">Prev</Button>
                       <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold px-4 shadow-sm">Next</Button>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-sm overflow-hidden">
               <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10 py-3">
                  <div className="flex items-center gap-2">
                     <Zap className="w-4 h-4 text-emerald-600" />
                     <CardTitle className="text-sm font-bold text-emerald-700">AI Recommendations</CardTitle>
                  </div>
               </CardHeader>
               <CardContent className="p-4 space-y-4">
                  {[
                    { id: 1, title: "3 applications approaching SLA", text: "Cases 009, 010, and 002 will breach soon.", color: "border-amber-200 bg-amber-50/50" },
                    { id: 2, title: "Unusual spike in CME", text: "CME submissions are up 42%.", color: "border-blue-200 bg-blue-50/50" },
                  ].map((rec) => (
                    <div key={rec.id} className={`p-4 rounded-xl border ${rec.color} space-y-2 shadow-sm`}>
                       <div className="flex items-start gap-2">
                          <Brain className="w-3.5 h-3.5 mt-0.5" />
                          <p className="text-xs font-bold leading-tight">{rec.title}</p>
                       </div>
                       <p className="text-[10px] opacity-80">{rec.text}</p>
                    </div>
                  ))}
               </CardContent>
            </Card>

            <Card className="border-border shadow-sm overflow-hidden h-fit sticky top-6">
               <CardHeader className="py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-bold">Agent Activity</CardTitle>
                     </div>
                     <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] h-5 gap-1.5 px-2 font-bold shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                     </Badge>
                  </div>
               </CardHeader>
               <CardContent className="p-4 space-y-5">
                  <div className="relative">
                     <div className="absolute left-[13px] top-2 bottom-0 w-px bg-border/60" />
                     <div className="space-y-6 relative">
                        {AGENT_ACTIVITY.map((act) => (
                        <div key={act.id} className="flex gap-4 group">
                           <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center border border-border group-hover:border-primary/30 transition-all z-10">
                              {act.icon}
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                 <p className="text-[11px] font-bold text-foreground leading-tight">{act.text}</p>
                                 <span className="text-[9px] text-muted-foreground font-medium">{act.time}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground opacity-80">{act.sub}</p>
                           </div>
                        </div>
                        ))}
                     </div>
                  </div>
                  <Button variant="ghost" className="w-full h-10 text-xs font-bold text-muted-foreground border-t border-border rounded-none -mx-4 -mb-4 mt-4">
                     View All Activity
                  </Button>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </HROpsLayout>
  );
}
