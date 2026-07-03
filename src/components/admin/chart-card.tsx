"use client";

import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}

export function ChartCard({ title, children, subtitle, action }: ChartCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

// Simple bar chart using CSS
interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export function SimpleBarChart({ data, maxValue }: { data: BarChartData[]; maxValue?: number }) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-muted w-20 truncate text-right">{item.label}</span>
          <div className="flex-1 h-6 bg-border-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || "var(--color-accent)",
                minWidth: item.value > 0 ? "8px" : "0",
              }}
            />
          </div>
          <span className="text-xs font-semibold text-ink w-10 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// Simple line-like sparkline using CSS
export function Sparkline({ values, color = "var(--color-accent)" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-[2px] h-10">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-300"
          style={{
            height: `${((v - min) / range) * 100}%`,
            backgroundColor: color,
            opacity: 0.3 + (i / values.length) * 0.7,
            minHeight: "2px",
          }}
        />
      ))}
    </div>
  );
}
