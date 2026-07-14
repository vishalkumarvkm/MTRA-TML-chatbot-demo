"use client";

import { Layout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AIConfidenceBadge } from "@/components/ui/AIConfidenceBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockApplications } from "@/data/mockData";
import { use } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MessageSquare,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Find application or use a mock fallback
  const app = mockApplications.find((a) => a.id === id) || mockApplications[0];

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  return (
    <Layout
      title={`Application: ${id}`}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "My Applications", href: "/applications" },
        { label: id },
      ]}
    >
      <div className="p-6 space-y-6 max-w-6xl mx-auto" data-ocid="case_details.page">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Submitted on Dec 12, 2025</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              SLA: 42 days remaining
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold">
                  Course Information
                </CardTitle>
                <StatusBadge status={app.status} />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
                      Institution
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {app.institution}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
                      Course Title
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {app.courseTitle}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
                      Amount
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(app.amount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {["Enrollment Verification", "Tuition Invoice", "Grades"].map(
                    (doc, idx) => (
                      <div
                        key={doc}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{doc}</p>
                            <p className="text-[10px] text-muted-foreground">
                              PDF • 2.4 MB • Verified by AI
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <AIConfidenceBadge confidence={98} size="sm" />
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Audit Log</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  {[
                    {
                      label: "Application Created",
                      date: "Dec 12, 10:42 am",
                      user: "System",
                    },
                    {
                      label: "AI Validation Passed",
                      date: "Dec 12, 10:43 am",
                      user: "HealthyME AI",
                    },
                    {
                      label: "Assigned to HR",
                      date: "Dec 13, 9:15 am",
                      user: "System",
                    },
                  ].map((log, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {idx < 2 && <div className="w-px h-full bg-border" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-semibold">{log.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {log.date} • {log.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button className="w-full gap-2 h-11">
              <MessageSquare className="w-4 h-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
