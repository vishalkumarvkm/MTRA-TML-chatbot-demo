"use client";

import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  History,
  Info,
  Lock,
  RotateCcw,
  Save,
  Scale,
  Settings,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function PolicyAdminPage() {
  const [pendingChanges, setPendingChanges] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const POLICY_HISTORY = [
    {
      id: "v1.4",
      date: "2026-01-15",
      actor: "Sarah Kim",
      change: "Updated IRS §127 threshold to $5,250",
      status: "Active",
    },
    {
      id: "v1.3",
      date: "2025-11-02",
      actor: "Derek Chen",
      change: "Modified NYSNA SLA window to 45 days",
      status: "Historical",
    },
    {
      id: "v1.2",
      date: "2025-08-20",
      actor: "Sarah Kim",
      change: "Added MMC Scholarship Program v2",
      status: "Historical",
    },
  ];

  return (
    <Layout
      title="Policy Administration"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Policy Configuration" },
      ]}
    >
      <div className="p-6 space-y-6 max-w-6xl mx-auto bg-muted/20 min-h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              Program Policy Configuration
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage eligibility rules, limits, and compliance guardrails
              without code changes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 shadow-sm font-bold text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Revert All
            </Button>
            <Button
              size="sm"
              className="h-9 gap-2 bg-primary shadow-sm font-bold text-xs"
              onClick={() => setPendingChanges(true)}
            >
              <Save className="w-3.5 h-3.5" />
              Deploy Policy v1.5
            </Button>
          </div>
        </div>

        {pendingChanges && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">
                  4-Eyes Principle Required
                </p>
                <p className="text-[10px] text-amber-700">
                  Changes to core financial limits require verification by a
                  second HR Administrator before activation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 bg-amber-600 font-bold text-[10px]"
                onClick={() => setIsApproving(true)}
              >
                Request Approval
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-[10px] font-bold"
                onClick={() => setPendingChanges(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Limits */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4 border-b border-border bg-muted/10">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-bold">
                    Financial & Credit Thresholds
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      IRS §127 Annual Cap
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">
                        $
                      </span>
                      <Input
                        defaultValue="5,250"
                        className="pl-6 h-10 font-bold text-sm bg-card"
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      Global threshold for tax-free tuition reimbursement.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Max Annual Credits
                    </Label>
                    <Input
                      defaultValue="18"
                      className="h-10 font-bold text-sm bg-card"
                    />
                    <p className="text-[9px] text-muted-foreground">
                      Standardized cap across all degree-seeking programs.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      NYSNA SLA window
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        defaultValue="45"
                        className="h-10 font-bold text-sm bg-card"
                      />
                      <span className="text-xs font-bold text-muted-foreground whitespace-nowrap uppercase tracking-widest">
                        Days
                      </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      Article 35 mandatory processing timeframe.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Min Grade Requirement
                    </Label>
                    <Input
                      defaultValue="B"
                      className="h-10 font-bold text-sm bg-card"
                    />
                    <p className="text-[9px] text-muted-foreground">
                      Requirement for successful reimbursement posting.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eligibility Switches */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4 border-b border-border bg-muted/10">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-bold">
                    Automated Eligibility Guardrails
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {[
                  {
                    label: "Service Agreement Requirement",
                    desc: "Auto-generate 12-month commitment for all tuition payouts.",
                    active: true,
                  },
                  {
                    label: "Workday Tenure Verification",
                    desc: "Enforce 6-month minimum employment check via Workday API.",
                    active: true,
                  },
                  {
                    label: "Manager Double-Approval",
                    desc: "Require both direct manager and department head for Scholarship.",
                    active: false,
                  },
                  {
                    label: "Budget Overrun Alerts",
                    desc: "Notify Finance if annual program spend exceeds 90%.",
                    active: true,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-5 border-b border-border last:border-0 hover:bg-muted/5 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground max-w-sm">
                        {item.desc}
                      </p>
                    </div>
                    <Switch defaultChecked={item.active} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            {/* Version History */}
            <Card className="border-border shadow-sm overflow-hidden">
              <CardHeader className="py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest">
                    Version History
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {POLICY_HISTORY.map((ver, i) => (
                  <div
                    key={ver.id}
                    className="p-4 border-b border-border last:border-0 space-y-2 group hover:bg-muted/5 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <Badge
                        variant="outline"
                        className={`text-[8px] h-4 px-1.5 ${ver.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-muted text-muted-foreground border-transparent"}`}
                      >
                        {ver.id} {ver.status.toUpperCase()}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground font-medium">
                        {ver.date}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold leading-tight group-hover:text-primary transition-colors">
                      {ver.change}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      Actor: {ver.actor}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Policy Governance</p>
                    <p className="text-[10px] text-muted-foreground italic leading-tight">
                      All changes are logged in the immutable audit trail and
                      synced to the Compliance Dashboard.
                    </p>
                  </div>
                </div>
                <Separator className="bg-primary/10" />
                <Button
                  variant="link"
                  className="h-auto p-0 text-[10px] font-bold text-primary flex items-center gap-1"
                >
                  Download Master Policy PDF{" "}
                  <ArrowUpRight className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>

            <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-border flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-muted-foreground opacity-30" />
              <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                All financial logic is cryptographically signed. Bypassing these
                guardrails triggers a critical alert to the HR Director and CIO.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
