"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { mockAuditEntries } from "@/data/mockData";
import {
  BarChart3,
  Download,
  FileText,
  Filter,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  PieChart,
  Calendar,
  Search,
  Lock,
  History,
  Activity,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Pie,
  PieChart as RePieChart,
} from "recharts";

const SPEND_DATA = [
  { name: "Tuition", amount: 452000, color: "oklch(0.63 0.19 250)" },
  { name: "CME", amount: 128000, color: "oklch(0.60 0.16 220)" },
  { name: "Scholarship", amount: 85000, color: "oklch(0.70 0.15 180)" },
  { name: "Dependent", amount: 42000, color: "oklch(0.55 0.18 280)" },
];

const TAX_DATA = [
  { name: "Non-Taxable (§127)", value: 75, color: "oklch(0.65 0.15 160)" },
  { name: "Taxable Benefit", value: 25, color: "oklch(0.60 0.15 30)" },
];

export default function ComplianceDashboard() {
  const [reportLoading, setReportLoading] = useState<string | null>(null);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const handleDownload = (name: string) => {
    setReportLoading(name);
    setTimeout(() => setReportLoading(null), 2000);
  };

  return (
    <Layout
      title="Compliance & Audit"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Compliance Hub" },
      ]}
    >
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto bg-muted/20 min-h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-3">
               <Lock className="w-6 h-6 text-primary" />
               Compliance & Audit Command Center
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Continuous audit-readiness | NYSNA Adherence | Tax Split | Immutable Logs</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm">
               <History className="w-3.5 h-3.5" />
               Snapshot History
            </Button>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 h-9 px-3 font-bold gap-2">
               <ShieldCheck className="w-4 h-4" />
               Audit Ready
            </Badge>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Annual Spend", value: "$707,000", sub: "14% of $5M Budget", icon: TrendingUp, color: "primary" },
            { label: "NYSNA Adherence", value: "98.2%", sub: "45-day window met", icon: Activity, color: "emerald" },
            { label: "IRS §127 Utilization", value: "$528k", sub: "Tax-free optimization", icon: PieChart, color: "blue" },
            { label: "Open Exceptions", value: "4", sub: "Requires attention", icon: AlertCircle, color: "amber" },
          ].map((stat, i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-1.5 rounded-lg bg-muted/50 text-${stat.color}-600`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-display mb-1">{stat.value}</div>
                <p className="text-[10px] text-muted-foreground font-medium">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Analytics Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Spend Breakdown Chart */}
               <Card className="border-border shadow-sm">
                  <CardHeader className="pb-2 flex-row items-center justify-between">
                     <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Program Spend Breakdown</CardTitle>
                     <BarChart3 className="w-4 h-4 text-muted-foreground opacity-40" />
                  </CardHeader>
                  <CardContent className="h-[200px] sm:h-[240px] pt-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={SPEND_DATA} layout="vertical" margin={{ left: -20 }}>
                           <XAxis type="number" hide />
                           <YAxis 
                              dataKey="name" 
                              type="category" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fontWeight: 600 }}
                           />
                           <Tooltip 
                              cursor={{ fill: 'transparent' }}
                              content={({ active, payload }) => {
                                 if (active && payload && payload.length && payload[0].value !== undefined) {
                                    return (
                                       <div className="bg-popover border border-border p-2 rounded-lg shadow-md">
                                          <p className="text-[10px] font-bold">{Number(payload[0].value).toLocaleString()}</p>
                                       </div>
                                    );
                                 }
                                 return null;
                              }}
                           />
                           <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
                              {SPEND_DATA.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </CardContent>
               </Card>

               {/* Tax Split Chart */}
               <Card className="border-border shadow-sm">
                  <CardHeader className="pb-2 flex-row items-center justify-between">
                     <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">IRS §127 Tax Optimization</CardTitle>
                     <PieChart className="w-4 h-4 text-muted-foreground opacity-40" />
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-[200px] sm:h-[240px] pt-4">
                     <div className="h-[160px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <RePieChart>
                              <Pie
                                 data={TAX_DATA}
                                 cx="50%"
                                 cy="50%"
                                 innerRadius={45}
                                 outerRadius={65}
                                 paddingAngle={5}
                                 dataKey="value"
                              >
                                 {TAX_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Pie>
                              <Tooltip />
                           </RePieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="flex gap-4 mt-2">
                        {TAX_DATA.map((item, i) => (
                           <div key={i} className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-[9px] font-bold text-muted-foreground">{item.name} ({item.value}%)</span>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* NYSNA 45-Day Adherence */}
            <Card className="border-border shadow-sm">
               <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-sm font-bold">NYSNA Article 35 Adherence (Monthly)</CardTitle>
                     <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">Exceeding Target</Badge>
                  </div>
               </CardHeader>
               <CardContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Adherence Rate</p>
                        <div className="text-2xl font-bold">98.2%</div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                           <TrendingUp className="w-3 h-3" /> +1.4% vs last mo.
                        </div>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Avg. Processing Time</p>
                        <div className="text-2xl font-bold text-foreground">7.4 Days</div>
                        <p className="text-[10px] text-muted-foreground">Target: 45 Days max</p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Breached SLA</p>
                        <div className="text-2xl font-bold text-destructive">2 Cases</div>
                        <p className="text-[10px] text-muted-foreground">Immediate escalation active</p>
                     </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                     <div className="h-full bg-emerald-500 w-[98%]" />
                     <div className="h-full bg-destructive w-[2%]" />
                  </div>
               </CardContent>
            </Card>

            {/* Immutable Audit Log */}
            <Card className="border-border shadow-sm overflow-hidden">
               <CardHeader className="py-4 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-bold">Immutable Audit History</CardTitle>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                           <input 
                              type="text" 
                              placeholder="Filter logs..." 
                              className="h-8 pl-8 pr-4 text-[10px] rounded-lg border border-border bg-background w-[180px] focus:ring-1 focus:ring-primary outline-none transition-all"
                           />
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] gap-1.5 font-bold"><Filter className="w-3 h-3" /> Filter</Button>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-muted/10">
                              <TableHead className="text-[10px] font-bold uppercase px-6 h-10">Timestamp</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase h-10">Actor</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase h-10">Action</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase h-10">Entity</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase h-10 text-right pr-6">SHA-256</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {mockAuditEntries.slice(0, 8).map((log, i) => (
                             <TableRow key={i} className="hover:bg-muted/20 border-b border-border/50">
                                <TableCell className="px-6 text-[10px] font-mono text-muted-foreground whitespace-nowrap">{log.timestamp}</TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold">{log.actor}</span>
                                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 font-mono uppercase tracking-tighter">{log.actorRole}</Badge>
                                   </div>
                                </TableCell>
                                <TableCell className="text-[10px] font-medium text-foreground">{log.action}</TableCell>
                                <TableCell className="text-[10px] font-mono text-muted-foreground uppercase">{log.entityId}</TableCell>
                                <TableCell className="text-right pr-6">
                                   <Badge className="bg-muted/50 text-muted-foreground text-[8px] font-mono border-none">
                                      {Math.random().toString(36).substring(7).toUpperCase()}...
                                   </Badge>
                                </TableCell>
                             </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
                  <Button variant="ghost" className="w-full h-10 text-[10px] font-bold text-muted-foreground border-t border-border rounded-none">
                     Load More Audit Records
                  </Button>
               </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Reporting & Alerts */}
          <aside className="space-y-6">
             <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
                <CardHeader className="py-3 border-b border-primary/10">
                   <div className="flex items-center gap-2 text-primary">
                      <FileText className="w-4 h-4" />
                      <CardTitle className="text-xs font-bold uppercase tracking-widest">Report Generator</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                   {[
                     { id: "nysna", label: "NYSNA Compliance Report", desc: "Article 35 adherence data for Labor Relations." },
                     { id: "127", label: "IRS §127 Reconciliation", desc: "Year-to-date taxable fringe benefit split." },
                     { id: "spend", label: "Spend Summary by Dept", desc: "Detailed budget utilization by cost center." },
                   ].map((report) => (
                     <div key={report.id} className="p-3 bg-white rounded-xl border border-primary/10 space-y-2 group hover:border-primary/30 transition-all shadow-sm">
                        <div className="flex justify-between items-start">
                           <p className="text-xs font-bold">{report.label}</p>
                           <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleDownload(report.id)}
                              disabled={reportLoading === report.id}
                           >
                              {reportLoading === report.id ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                           </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                           {report.desc}
                        </p>
                     </div>
                   ))}
                </CardContent>
             </Card>

             <Card className="border-amber-500/20 bg-amber-500/5 shadow-sm">
                <CardHeader className="py-3 border-b border-amber-500/10">
                   <div className="flex items-center gap-2 text-amber-700">
                      <AlertCircle className="w-4 h-4" />
                      <CardTitle className="text-xs font-bold uppercase tracking-widest">Anomalies Detected</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                   {[
                     { title: "Unusual Spend Spike", text: "Department 'Internal Medicine' exceeded 90% of budget 4 months early.", priority: "high" },
                     { title: "Policy Exception Pattern", text: "Multiple 'B-' grade approvals detected in NYSNA pool.", priority: "medium" },
                   ].map((alert, i) => (
                     <div key={i} className="bg-white p-3 rounded-xl border border-amber-200 space-y-2 shadow-sm">
                        <div className="flex justify-between items-start">
                           <p className="text-xs font-bold leading-tight">{alert.title}</p>
                           <div className={`w-1.5 h-1.5 rounded-full ${alert.priority === 'high' ? 'bg-destructive animate-pulse' : 'bg-amber-500'}`} />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                           {alert.text}
                        </p>
                        <Button variant="ghost" size="sm" className="h-6 text-[9px] px-2 text-amber-700 hover:bg-amber-50 gap-1 font-bold">
                           Investigate <ChevronRight className="w-2.5 h-2.5" />
                        </Button>
                     </div>
                   ))}
                </CardContent>
             </Card>

             <Card className="border-border shadow-sm bg-card">
                <CardHeader className="py-3 border-b border-border bg-muted/20">
                   <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Policy Guardrails</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                   <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                         <span className="text-muted-foreground">IRS Threshold Monitoring</span>
                         <span className="text-primary">$5,250</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                         <span className="text-muted-foreground">NYSNA SLA Guardrail</span>
                         <span className="text-emerald-600">45 DAYS</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                         <span className="text-muted-foreground">Service Agreement Cap</span>
                         <span className="text-violet-600">$3,000</span>
                      </div>
                   </div>
                   <Separator />
                   <p className="text-[9px] text-muted-foreground leading-relaxed italic text-center">
                      All platform actions are cryptographically signed and cross-referenced with Workday HRIS for integrity.
                   </p>
                </CardContent>
             </Card>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
