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
import { mockServiceAgreements } from "@/data/mockData";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  History,
  Info,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function ServiceAgreementsPage() {
  const [selectedSaId, setSelectedSaId] = useState<string | null>(
    mockServiceAgreements[0].id
  );

  const selectedSa = mockServiceAgreements.find((s) => s.id === selectedSaId);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "ExpiringSoon":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "Breached":
        return "bg-destructive/10 text-destructive border-transparent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <Layout
      title="Service Agreements"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Service Agreements" },
      ]}
    >
      <div className="flex flex-col lg:flex-row lg:h-full lg:overflow-hidden bg-muted/20">
        {/* Main List */}
        <div className="flex-1 flex flex-col min-h-0 lg:overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">Service Agreement Tracker</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Monitoring 12-month post-reimbursement employment commitments</p>
            </div>
            <div className="flex items-center gap-2">
               <Badge className="bg-primary/10 text-primary border-transparent h-8 px-3 font-bold">
                 {mockServiceAgreements.length} Active Agreements
               </Badge>
            </div>
          </div>

          <Card className="border-border shadow-sm overflow-hidden shrink-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                      <TableHead className="text-[10px] font-bold uppercase px-6 h-11">Employee</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase h-11">Amount</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase h-11">Commitment End</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase h-11">Status</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase h-11 text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {mockServiceAgreements.map((sa) => (
                    <TableRow 
                      key={sa.id} 
                      className={`cursor-pointer transition-colors ${selectedSaId === sa.id ? "bg-primary/5 hover:bg-primary/5" : "hover:bg-muted/30"}`}
                      onClick={() => setSelectedSaId(sa.id)}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{sa.employeeName}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">{sa.employeeId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{formatCurrency(sa.amount)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{sa.endDate}</span>
                          <span className={`text-[9px] font-bold ${calculateDaysRemaining(sa.endDate) < 30 ? "text-destructive" : calculateDaysRemaining(sa.endDate) < 90 ? "text-amber-600" : "text-muted-foreground"}`}>
                            {calculateDaysRemaining(sa.endDate)} days remaining
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[9px] h-5 px-1.5 ${getStatusColor(sa.status)}`}>
                          {sa.status.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          </Card>

          {/* Repayment Calculator (Static view for selected) */}
          {selectedSa && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
               <Card className="border-border shadow-sm bg-card">
                  <CardHeader className="pb-2 border-b border-border bg-muted/20">
                     <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-foreground">Repayment Calculator</CardTitle>
                     </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Original Reimbursement</span>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(selectedSa.amount)}</span>
                     </div>
                     <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                           <span>Commitment Completion</span>
                           <span>{100 - Math.round((calculateDaysRemaining(selectedSa.endDate) / 365) * 100)}%</span>
                        </div>
                        <Progress value={100 - (calculateDaysRemaining(selectedSa.endDate) / 365) * 100} className="h-1.5 bg-muted" />
                     </div>
                     <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 space-y-3">
                        <div className="flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4 text-destructive" />
                           <span className="text-xs font-bold text-destructive uppercase tracking-wide">Prorated Liability</span>
                        </div>
                        <p className="text-[11px] text-destructive/80 leading-relaxed">
                           If the employee departs today, the required repayment amount under the signed agreement is:
                        </p>
                        <div className="text-3xl font-bold text-destructive">{formatCurrency(selectedSa.proratedRepayment)}</div>
                        <p className="text-[10px] text-muted-foreground italic">
                           Formula: (Amount × Remaining Months ÷ 12)
                        </p>
                     </div>
                  </CardContent>
               </Card>

               <Card className="border-border shadow-sm bg-card">
                  <CardHeader className="pb-2 border-b border-border bg-muted/20">
                     <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-foreground">Agreement Details</CardTitle>
                     </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                           <p className="text-[9px] font-bold text-muted-foreground uppercase">Start Date</p>
                           <p className="text-xs font-bold">{selectedSa.startDate}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-bold text-muted-foreground uppercase">End Date</p>
                           <p className="text-xs font-bold">{selectedSa.endDate}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-bold text-muted-foreground uppercase">Term Duration</p>
                           <p className="text-xs font-bold">12 Months</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-bold text-muted-foreground uppercase">Application ID</p>
                           <p className="text-xs font-bold font-mono">{selectedSa.applicationId}</p>
                        </div>
                     </div>
                     
                     <div className="pt-2">
                        <Button className="w-full bg-primary text-white font-bold h-10 gap-2 shadow-sm" onClick={() => window.open(selectedSa.docusignUrl, '_blank')}>
                           <ExternalLink className="w-4 h-4" />
                           View Signed DocuSign
                        </Button>
                        <Button variant="ghost" className="w-full mt-2 h-9 text-xs text-muted-foreground gap-2">
                           <Download className="w-4 h-4" />
                           Download PDF Copy
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </div>
          )}
        </div>

        {/* Right Sidebar: Recent Activity & Alerts */}
        <aside className="w-full lg:w-80 bg-card border-t lg:border-t-0 lg:border-l border-border lg:overflow-y-auto flex-shrink-0 h-auto lg:h-full">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
             <Card className="border-amber-500/20 bg-amber-500/5 overflow-hidden shadow-sm">
                <CardHeader className="p-4 border-b border-amber-500/10">
                   <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-amber-700">Expiration Alerts</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                   {[
                     { name: "Carlos Rivera", days: 24, status: "ExpiringSoon" },
                     { name: "Aisha Thompson", days: 8, status: "Critical" },
                   ].map((alert, i) => (
                     <div key={i} className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                           <p className="text-xs font-bold">{alert.name}</p>
                           <Badge className="bg-amber-100 text-amber-700 text-[8px] h-4 border-transparent">T-{alert.days}d</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                           Agreement commitment ends in {alert.days} days. Ensure employee remains in good standing.
                        </p>
                     </div>
                   ))}
                </CardContent>
             </Card>

             <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                   <History className="w-4 h-4 text-muted-foreground" />
                   <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Recent Events</h2>
                </div>
                <div className="space-y-4 relative">
                   <div className="absolute left-[13px] top-2 bottom-0 w-px bg-border/60" />
                   {[
                     { text: "SA-003 Generated", sub: "Latasha Williams", time: "2d ago", icon: FileText },
                     { text: "SA-003 Signed", sub: "Via DocuSign", time: "2d ago", icon: ShieldCheck },
                     { text: "SA-002 Alert Sent", sub: "90-day countdown", time: "5d ago", icon: Clock },
                   ].map((event, i) => (
                     <div key={i} className="flex gap-4 relative z-10">
                        <div className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm">
                           <event.icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                           <p className="text-[11px] font-bold text-foreground leading-tight">{event.text}</p>
                           <p className="text-[9px] text-muted-foreground">{event.sub} • {event.time}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
