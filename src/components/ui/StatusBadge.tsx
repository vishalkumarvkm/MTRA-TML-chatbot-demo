import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ApplicationStatus, ApprovalStatus, SlaStatus } from "@/types";

const APP_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  Draft: {
    label: "Draft",
    className: "bg-brand-grey text-brand-black border-brand-grey hover:bg-brand-grey",
  },
  Submitted: {
    label: "Submitted",
    className:
      "bg-brand-lightblue text-brand-blue border-brand-lightblue2/30 hover:bg-brand-lightblue",
  },
  UnderReview: {
    label: "Under Review",
    className:
      "bg-brand-lightblue2/20 text-brand-blue border-brand-lightblue2/50 hover:bg-brand-lightblue2/30",
  },
  PendingApproval: {
    label: "Pending Approval",
    className:
      "bg-brand-lightblue2/20 text-brand-blue border-brand-lightblue2/50 hover:bg-brand-lightblue2/30",
  },
  Approved: {
    label: "Approved",
    className:
      "bg-brand-mint/20 text-brand-teal border-brand-mint/70 hover:bg-brand-mint/30",
  },
  Rejected: {
    label: "Rejected",
    className:
      "bg-brand-black text-brand-white border-brand-black hover:bg-brand-black/90",
  },
  Escalated: {
    label: "Escalated",
    className:
      "bg-brand-grey text-brand-black border-brand-grey hover:bg-brand-grey",
  },
};

const SLA_STATUS_CONFIG: Record<
  SlaStatus,
  { label: string; className: string }
> = {
  OnTrack: {
    label: "On Track",
    className:
      "bg-brand-mint/20 text-brand-teal border-brand-mint/70 hover:bg-brand-mint/30",
  },
  AtRisk: {
    label: "At Risk",
    className:
      "bg-brand-lightblue2/20 text-brand-blue border-brand-lightblue2/50 hover:bg-brand-lightblue2/30",
  },
  Overdue: {
    label: "Overdue",
    className:
      "bg-brand-black text-brand-white border-brand-black hover:bg-brand-black/90",
  },
};

const APPROVAL_STATUS_CONFIG: Record<
  ApprovalStatus,
  { label: string; className: string }
> = {
  Pending: {
    label: "Pending",
    className:
      "bg-brand-lightblue2/20 text-brand-blue border-brand-lightblue2/50 hover:bg-brand-lightblue2/30",
  },
  Approved: {
    label: "Approved",
    className:
      "bg-brand-mint/20 text-brand-teal border-brand-mint/70 hover:bg-brand-mint/30",
  },
  Rejected: {
    label: "Rejected",
    className:
      "bg-brand-black text-brand-white border-brand-black hover:bg-brand-black/90",
  },
  Escalated: {
    label: "Escalated",
    className:
      "bg-brand-grey text-brand-black border-brand-grey hover:bg-brand-grey",
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus | SlaStatus | ApprovalStatus;
  type?: "application" | "sla" | "approval";
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status,
  type = "application",
  size = "md",
  className,
}: StatusBadgeProps) {
  let config: { label: string; className: string } | undefined;
  if (type === "sla") config = SLA_STATUS_CONFIG[status as SlaStatus];
  else if (type === "approval")
    config = APPROVAL_STATUS_CONFIG[status as ApprovalStatus];
  else config = APP_STATUS_CONFIG[status as ApplicationStatus];

  if (!config) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        size === "sm" ? "text-xs px-1.5 py-0" : "text-xs px-2 py-0.5",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
