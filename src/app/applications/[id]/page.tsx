"use client";

import { Layout } from "@/components/layout/Layout";
import { AIConfidenceBadge } from "@/components/ui/AIConfidenceBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/appStore";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface BackendDocument {
  id: number;
  application_id: number;
  filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

interface BackendApplication {
  id: number;
  course_name: string;
  institution_name: string;
  tuition_fee: number;
  semester: string;
  status: string;
  created_at: string;
}

export default function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const accessToken = useAppStore((s) => s.accessToken);

  // Fetch application details
  const { data: appData, isLoading: appLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const res = await fetchApi<{ data: BackendApplication }>(
        `/applications/${id}`
      );
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch documents for this application
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ["application-documents", id],
    queryFn: async () => {
      const res = await fetchApi<{ data: BackendDocument[] }>(
        `/applications/${id}/documents`
      );
      return res.data;
    },
    enabled: !!id,
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (doc: { id: number; filename: string; filepath?: string }) => {
    try {
      const token = useAppStore.getState().accessToken;
      const targetUrl = doc.filepath && (doc.filepath.startsWith("http://") || doc.filepath.startsWith("https://"))
        ? doc.filepath
        : `${API_BASE_URL}/documents/${doc.id}/download${token ? `?token=${encodeURIComponent(token)}` : ""}`;

      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = doc.filename || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      if (doc.filepath && doc.filepath.startsWith("http")) {
        const a = document.createElement("a");
        a.href = doc.filepath;
        a.download = doc.filename || "document";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }
  };

  const isLoading = appLoading || docsLoading;

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
          {appData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Submitted on{" "}
                {new Date(appData.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                SLA: 42 days remaining
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">
              {/* Course Information */}
              <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-bold">
                    Course Information
                  </CardTitle>
                  {appData && <StatusBadge status={appData.status as import("@/types").ApplicationStatus} />}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
                        Institution
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {appData?.institution_name ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
                        Course Title
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {appData?.course_name ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
                        Amount
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {appData ? formatCurrency(appData.tuition_fee) : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Documents
                    {documents.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({documents.length})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {documents.length === 0 ? (
                    <p className="px-4 pb-4 text-sm text-muted-foreground">
                      No documents uploaded yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                          data-ocid={`document.row.${doc.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{doc.filename}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {doc.mime_type.split("/")[1]?.toUpperCase() ?? "FILE"}{" "}
                                • {formatBytes(doc.size_bytes)} • Verified by AI
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <AIConfidenceBadge confidence={98} size="sm" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title={`Download ${doc.filename}`}
                              onClick={() => handleDownload(doc)}
                              data-ocid={`document.download.${doc.id}`}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Audit Log</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-4">
                    {[
                      { label: "Application Created", date: "Dec 12, 10:42 am", user: "System" },
                      { label: "AI Validation Passed", date: "Dec 12, 10:43 am", user: "HealthyME AI" },
                      { label: "Assigned to Admin", date: "Dec 13, 9:15 am", user: "System" },
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
        )}
      </div>
    </Layout>
  );
}
