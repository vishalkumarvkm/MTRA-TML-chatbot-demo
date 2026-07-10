import { cn } from "@/lib/utils";

interface AIConfidenceBadgeProps {
  confidence: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getConfidenceConfig(confidence: number) {
  if (confidence >= 85) {
    return {
      label: "High",
      barClass: "bg-brand-teal",
      textClass: "text-brand-teal",
      bgClass: "bg-brand-mint/20",
      borderClass: "border-brand-mint/50",
    };
  }
  if (confidence >= 70) {
    return {
      label: "Medium",
      barClass: "bg-brand-lightblue2",
      textClass: "text-brand-blue",
      bgClass: "bg-brand-lightblue",
      borderClass: "border-brand-lightblue2/30",
    };
  }
  return {
    label: "Low",
    barClass: "bg-brand-black",
    textClass: "text-brand-black dark:text-brand-white",
    bgClass: "bg-brand-grey",
    borderClass: "border-brand-grey",
  };
}

export function AIConfidenceBadge({
  confidence,
  showLabel = true,
  size = "md",
  className,
}: AIConfidenceBadgeProps) {
  const config = getConfidenceConfig(confidence);
  const barWidth = Math.max(0, Math.min(100, confidence));

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-2 py-1 font-medium",
        config.bgClass,
        config.borderClass,
        size === "sm" && "px-1.5 py-0.5 text-xs",
        size === "lg" && "px-3 py-1.5",
        className,
      )}
      title={`AI Confidence: ${confidence}%`}
    >
      <span className="text-xs">🤖</span>
      <div
        className={cn(
          "rounded-full bg-border",
          size === "sm"
            ? "h-1 w-12"
            : size === "lg"
              ? "h-2 w-20"
              : "h-1.5 w-16",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            config.barClass,
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <span className={cn("tabular-nums text-xs", config.textClass)}>
        {confidence}%
      </span>
      {showLabel && (
        <span className={cn("text-xs", config.textClass)}>{config.label}</span>
      )}
    </div>
  );
}
