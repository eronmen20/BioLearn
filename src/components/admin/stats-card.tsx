"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  trend?: { value: number; label: string };
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = "accent",
  trend,
  loading,
}: StatsCardProps) {
  const colorMap: Record<string, string> = {
    accent: "bg-accent/10 text-accent",
    green: "bg-green/10 text-green",
    red: "bg-red/10 text-red",
    blue: "bg-blue/10 text-blue",
    yellow: "bg-yellow/10 text-yellow",
    orange: "bg-orange/10 text-orange",
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.value >= 0
                ? "bg-green-light text-green"
                : "bg-red-light text-red"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-border-light rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-ink">{value}</p>
      )}
      <p className="text-xs text-muted mt-0.5">{title}</p>
    </div>
  );
}
