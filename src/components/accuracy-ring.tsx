import { useEffect, useState } from "react";

/**
 * Animated circular accuracy indicator. The value is always supplied by real data.
 */
export function AccuracyRing({
  value,
  label,
  caption,
  tone = "primary",
  size = 148,
}: {
  value: number;
  label: string;
  caption?: string;
  tone?: "primary" | "accent";
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setShown(clamped), 80);
    return () => clearTimeout(t);
  }, [clamped]);

  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (shown / 100) * circumference;
  const strokeColor = tone === "primary" ? "var(--color-primary)" : "var(--color-accent)";

  return (
    <div className="flex flex-col items-center">
      <p className="text-[10px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="relative mt-3" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-border/60"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold sm:text-4xl">{clamped}%</span>
          <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Accuracy
          </span>
        </div>
      </div>
      {caption && <p className="mt-3 text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}
