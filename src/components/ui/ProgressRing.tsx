import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  valueDisplay?: string;
  color?: "primary" | "accent" | "success" | "warning" | "danger";
  className?: string;
}

const STROKE_COLORS = {
  primary: {
    light: "var(--brand-blue, #003769)",
    dark: "var(--brand-lightblue2, #94c5e3)",
    track: "var(--brand-lightblue, #e6f0f5)",
    darkTrack: "rgba(255, 255, 255, 0.1)",
  },
  accent: {
    light: "var(--brand-teal, #009480)",
    dark: "var(--brand-mint, #acd3c0)",
    track: "var(--brand-lightblue, #e6f0f5)",
    darkTrack: "rgba(255, 255, 255, 0.1)",
  },
  success: {
    light: "var(--brand-teal, #009480)",
    dark: "var(--brand-mint, #acd3c0)",
    track: "var(--brand-lightblue, #e6f0f5)",
    darkTrack: "rgba(255, 255, 255, 0.1)",
  },
  warning: {
    light: "var(--state-warning, #F59E0B)",
    dark: "var(--state-warning, #F59E0B)",
    track: "var(--brand-lightblue, #e6f0f5)",
    darkTrack: "rgba(255, 255, 255, 0.1)",
  },
  danger: {
    light: "var(--state-error, #B8001F)",
    dark: "var(--state-error, #B8001F)",
    track: "var(--brand-lightblue, #e6f0f5)",
    darkTrack: "rgba(255, 255, 255, 0.1)",
  },
};

export function ProgressRing({
  value,
  max,
  size = 80,
  strokeWidth = 7,
  label,
  sublabel,
  valueDisplay,
  color = "primary",
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const center = size / 2;
  const colors = STROKE_COLORS[color];
  const displayValue = valueDisplay ?? `${Math.round(percentage)}%`;

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          role="img"
          aria-label={`${label}: ${displayValue}`}
        >
          {/* Track light */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="dark:hidden"
            stroke={colors.track}
          />
          {/* Track dark */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="hidden dark:block"
            stroke={colors.darkTrack}
          />
          {/* Progress light */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="dark:hidden transition-all duration-700 ease-out"
            stroke={colors.light}
          />
          {/* Progress dark */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="hidden dark:block transition-all duration-700 ease-out"
            stroke={colors.dark}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold font-display text-foreground leading-none">
            {displayValue}
          </span>
          {sublabel && (
            <span className="text-[9px] text-muted-foreground mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-foreground text-center leading-tight">
          {label}
        </span>
      )}
    </div>
  );
}
