import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ApplicationStatus, ApprovalStatus, SlaStatus } from "@/types";

const APP_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  Draft: {
    label: "Draft",
    className: "bg-[#e6e6e6] text-[#1a1a1a] border-0 hover:bg-[#e6e6e6]",
  },
  Submitted: {
    label: "Submitted",
    className: "bg-[#E6F0F5] text-[#003769] border-0 hover:bg-[#E6F0F5]",
  },
  UnderReview: {
    label: "Under Review",
    className: "bg-[#E6F0F5] text-[#003769] border-0 hover:bg-[#E6F0F5]",
  },
  PendingApproval: {
    label: "Pending Approval",
    className: "bg-[#E6F0F5] text-[#003769] border-0 hover:bg-[#E6F0F5]",
  },
  Approved: {
    label: "Approved",
    className: "bg-[#ebf3ef] text-[#008573] border-0 hover:bg-[#ebf3ef]",
  },
  Rejected: {
    label: "Rejected",
    className: "bg-[#1a1a1a] text-white border-0 hover:bg-[#1a1a1a]/90",
  },
  Escalated: {
    label: "Escalated",
    className: "bg-[#e6e6e6] text-[#1a1a1a] border-0 hover:bg-[#e6e6e6]",
  },
  Expired: {
    label: "Escalated",
    className: "bg-amber-100 text-amber-800 border-0 hover:bg-amber-100/80",
  },
};

const SLA_STATUS_CONFIG: Record<
  SlaStatus,
  { label: string; className: string }
> = {
  OnTrack: {
    label: "On Track",
    className: "bg-[#ebf3ef] text-[#008573] border-0 hover:bg-[#ebf3ef]",
  },
  AtRisk: {
    label: "At Risk",
    className: "bg-[#E6F0F5] text-[#003769] border-0 hover:bg-[#E6F0F5]",
  },
  Overdue: {
    label: "Overdue",
    className: "bg-[#1a1a1a] text-white border-0 hover:bg-[#1a1a1a]/90",
  },
};

const APPROVAL_STATUS_CONFIG: Record<
  ApprovalStatus,
  { label: string; className: string }
> = {
  Pending: {
    label: "Pending",
    className: "bg-[#E6F0F5] text-[#003769] border-0 hover:bg-[#E6F0F5]",
  },
  Approved: {
    label: "Approved",
    className: "bg-[#ebf3ef] text-[#008573] border-0 hover:bg-[#ebf3ef]",
  },
  Rejected: {
    label: "Rejected",
    className: "bg-[#1a1a1a] text-white border-0 hover:bg-[#1a1a1a]/90",
  },
  Escalated: {
    label: "Escalated",
    className: "bg-[#e6e6e6] text-[#1a1a1a] border-0 hover:bg-[#e6e6e6]",
  },
  Expired: {
    label: "Escalated",
    className: "bg-amber-100 text-amber-800 border-0 hover:bg-amber-100/80",
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus | SlaStatus | ApprovalStatus;
  type?: "application" | "sla" | "approval";
  size?: "sm" | "md";
  className?: string;
  isHROps?: boolean;
}

export function StatusBadge({
  status,
  type = "application",
  size = "md",
  className,
  isHROps = false,
}: StatusBadgeProps) {
  let config: { label: string; className: string } | undefined;
  if (type === "sla") config = SLA_STATUS_CONFIG[status as SlaStatus];
  else if (type === "approval")
    config = APPROVAL_STATUS_CONFIG[status as ApprovalStatus];
  else config = APP_STATUS_CONFIG[status as ApplicationStatus];

  if (!config) return null;

  const labelText =
    status === "Expired" && isHROps ? "Timed Out — Escalated" : config.label;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-bold rounded-full border-0",
        size === "sm" ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1",
        config.className,
        className,
      )}
    >
      {labelText}
    </Badge>
  );
}
