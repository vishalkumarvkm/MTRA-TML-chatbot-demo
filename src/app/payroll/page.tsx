"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  CheckCircle2,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  History,
  Info,
} from "lucide-react";
import { useState } from "react";

const POSTINGS = [
  { id: "P-101", empId: "EMP-44821", name: "Maria Santos", amount: 1800, glCode: "61200-TUIT", tax: "Non-Taxable (§127)", status: "Pending", program: "Tuition" },
  { id: "P-102", empId: "EMP-38104", name: "Dr. James Okonkwo", amount: 6000, glCode: "61300-DEPT", tax: "Taxable Benefit (Gross-up)", status: "Pending", program: "Dependent" },
  { id: "P-103", empId: "EMP-51247", name: "Latasha Williams", amount: 750, glCode: "61250-CME", tax: "Non-Taxable (§127)", status: "Reconciled", program: "CME" },
  { id: "P-104", empId: "EMP-33591", name: "Carlos Rivera", amount: 3250, glCode: "61200-TUIT", tax: "Non-Taxable (§127)", status: "Pending", program: "Tuition" },
];

export default function PayrollView() {
  const [reconciled, setReconciled] = useState<string[]>([]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const toggleReconcile = (id: string) => {
    setReconciled(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <Layout
      title="Payroll Integration"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Payroll Feed" },
      ]}
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto bg-muted/20 min-h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Workday Payroll Feed</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Automated reimbursement posting | Tax-split calculation | GL mapping</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm"><RefreshCw className="w-3.5 h-3.5" /> Sync Workday</Button>
            <Button size="sm" className="h-9 gap-2 bg-primary shadow-sm"><Download className="w-3.5 h-3.5" /> YTD Tax Report</Button>
          </div>
        </div>

        {/* Payroll Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border shadow-sm">
             <CardContent className="p-5 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Pending Posting</p>
                   <p className="text-2xl font-bold">$11,050</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                   <Zap className="w-5 h-5" />
                </div>
             </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
             <CardContent className="p-5 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Reconciled this Period</p>
                   <p className="text-2xl font-bold">$42,800</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                   <CheckCircle2 className="w-5 h-5" />
                </div>
             </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
             <CardContent className="p-5 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">IRS §127 Total (YTD)</p>
                   <p className="text-2xl font-bold">$384k</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                   <FileText className="w-5 h-5" />
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-border shadow-sm overflow-hidden">
               <CardHeader className="bg-card border-b border-border py-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-bold">Incoming Approved Postings</CardTitle>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                           <input type="text" placeholder="Search postings..." className="h-8 pl-8 pr-4 text-[10px] rounded-lg border border-border bg-background w-[180px]" />
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold gap-1.5"><Filter className="w-3 h-3" /> Filter</Button>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-muted/10">
                              <TableHead className="text-[10px] font-bold uppercase px-6 h-10 w-[50px]"><input type="checkbox" className="rounded" /></TableHead>
                              <TableHead className="text-[10px] font-bold uppercase h-10">Employee</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase h-10">Amount</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase h-10">GL Code</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase h-10">Tax Treatment</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase h-10 text-right pr-6">Status</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {POSTINGS.map((p) => (
                             <TableRow key={p.id} className="hover:bg-muted/20 border-b border-border/50 transition-colors">
                                <TableCell className="px-6 py-4"><input type="checkbox" className="rounded border-border" /></TableCell>
                                <TableCell>
                                   <div className="flex flex-col">
                                      <span className="text-xs font-bold">{p.name}</span>
                                      <span className="text-[9px] text-muted-foreground uppercase">{p.empId}</span>
                                   </div>
                                </TableCell>
                                <TableCell className="text-xs font-bold">{formatCurrency(p.amount)}</TableCell>
                                <TableCell className="text-[10px] font-mono font-bold text-primary">{p.glCode}</TableCell>
                                <TableCell>
                                   <Badge variant="outline" className={`text-[8px] h-4 px-1 ${p.tax.includes('Taxable') ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                      {p.tax}
                                   </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                   <Button 
                                      size="sm" 
                                      variant={reconciled.includes(p.id) ? "ghost" : "outline"}
                                      className={`h-7 text-[9px] font-bold gap-1.5 ${reconciled.includes(p.id) ? 'text-emerald-600' : 'text-primary'}`}
                                      onClick={() => toggleReconcile(p.id)}
                                   >
                                      {reconciled.includes(p.id) || p.status === 'Reconciled' ? (
                                        <>
                                           <CheckCircle2 className="w-3 h-3" />
                                           Reconciled
                                        </>
                                      ) : (
                                        <>Confirm Rec.</>
                                      )}
                                   </Button>
                                </TableCell>
                             </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
                  <div className="p-4 bg-muted/5 flex justify-end gap-2 border-t border-border">
                     <Button variant="outline" size="sm" className="h-9 px-4 font-bold text-xs">Flag for Review</Button>
                     <Button size="sm" className="h-9 px-6 bg-primary font-bold text-xs">Post to Workday (3 Selected)</Button>
                  </div>
               </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
             {/* Program 4 Impact Tracker */}
             <Card className="border-violet-500/20 bg-violet-500/5 shadow-sm">
                <CardHeader className="py-3 border-b border-violet-500/10">
                   <div className="flex items-center gap-2 text-violet-700">
                      <AlertTriangle className="w-4 h-4" />
                      <CardTitle className="text-xs font-bold uppercase tracking-widest">W-2 Impact Alert</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                   <p className="text-[10px] text-muted-foreground leading-relaxed">
                      High-value Dependent Tuition cases (Program 4) require manual withholding verification for correct W-2 reporting.
                   </p>
                   <div className="bg-white p-3 rounded-lg border border-violet-200 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                         <p className="text-xs font-bold">Dr. James Okonkwo</p>
                         <Badge className="bg-violet-100 text-violet-700 text-[8px] h-4">$6,000</Badge>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-bold text-muted-foreground uppercase">Estimated Tax Impact</p>
                         <p className="text-xs font-bold text-foreground">$1,450.00</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full h-7 text-[9px] font-bold border-violet-200 text-violet-700 hover:bg-violet-50">
                         Verify Calculation
                      </Button>
                   </div>
                </CardContent>
             </Card>

             <Card className="border-border shadow-sm">
                <CardHeader className="py-3 border-b border-border bg-muted/20">
                   <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">GL Mapping Reference</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                   {[
                     { label: "Tuition (NYSNA)", code: "61200-TUIT" },
                     { label: "CME (Non-Union)", code: "61250-CME" },
                     { label: "MMC Scholarship", code: "61280-SCHL" },
                     { label: "Dependent Tuition", code: "61300-DEPT" },
                   ].map((gl, i) => (
                     <div key={i} className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground font-medium">{gl.label}</span>
                        <span className="font-mono font-bold">{gl.code}</span>
                     </div>
                   ))}
                </CardContent>
             </Card>

             <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                   <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-800">Secure Transmission</p>
                      <p className="text-[9px] text-emerald-700/80">TLS 1.3 encrypted tunnel to Workday REST API active.</p>
                   </div>
                </CardContent>
             </Card>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
