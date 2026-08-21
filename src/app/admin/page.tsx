"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/admin/stats-card";
import { ChartCard, SimpleBarChart } from "@/components/admin/chart-card";
import {
  Users,
  BookOpen,
  HelpCircle,
  CreditCard,
  FlaskConical,
  Bot,
  UserCheck,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

interface AdminStats {
  totalUsers: number;
  totalSiswa: number;
  totalAdmin: number;
  totalProgress: number;
  usersToday: number;
  totalMateri: number;
  totalQuiz: number;
  totalFlashcard: number;
  totalPraktikum: number;
  totalReflection: number;
  totalAiRequest: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [babDistribution, setBabDistribution] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch("/api/admin/stats").then((r) => r.json()),
      adminFetch("/api/admin/analytics").then((r) => r.json()),
    ])
      .then(([statsData, analyticsData]) => {
        setStats(statsData.stats);
        setRecentUsers(statsData.recentUsers);
        setBabDistribution(analyticsData?.materi?.babDistribution || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const contentStats = babDistribution.length > 0 ? babDistribution : [];

  const activityData = (() => {
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const now = new Date();
    const days: { label: string; value: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const count = recentUsers.filter((u) => {
        const created = new Date(u.created_at);
        return created >= d && created < next;
      }).length;

      days.push({ label: dayNames[d.getDay()], value: count });
    }
    return days;
  })();

  const usersThisWeek = (() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recentUsers.filter((u) => new Date(u.created_at) >= weekAgo).length;
  })();

  const completionRate =
    stats && stats.totalMateri > 0 && stats.totalUsers > 0
      ? Math.round((stats.totalProgress / (stats.totalMateri * stats.totalUsers)) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Overview platform BioLearn</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        <StatsCard
          title="Total User"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="accent"
          loading={loading}
        />
        <StatsCard
          title="Total Materi"
          value={stats?.totalMateri ?? 0}
          icon={BookOpen}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Total Quiz"
          value={stats?.totalQuiz ?? 0}
          icon={HelpCircle}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Total Flashcard"
          value={stats?.totalFlashcard ?? 0}
          icon={CreditCard}
          color="yellow"
          loading={loading}
        />
        <StatsCard
          title="Total Praktikum"
          value={stats?.totalPraktikum ?? 0}
          icon={FlaskConical}
          color="orange"
          loading={loading}
        />
        <StatsCard
          title="AI Request"
          value={stats?.totalAiRequest ?? 0}
          icon={Bot}
          color="accent"
          loading={loading}
        />
        <StatsCard
          title="User Aktif Hari Ini"
          value={stats?.usersToday ?? 0}
          icon={UserCheck}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Siswa"
          value={stats?.totalSiswa ?? 0}
          icon={Users}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Admin"
          value={stats?.totalAdmin ?? 0}
          icon={Users}
          color="red"
          loading={loading}
        />
        <StatsCard
          title="Progress Records"
          value={stats?.totalProgress ?? 0}
          icon={TrendingUp}
          color="green"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="User Baru per Hari"
          subtitle="7 hari terakhir"
        >
          <SimpleBarChart data={activityData} />
        </ChartCard>

        <ChartCard
          title="Konten per Bab"
          subtitle="Jumlah sub-bab"
        >
          {contentStats.length > 0 ? (
            <SimpleBarChart
              data={contentStats.map(d => ({ ...d, color: "var(--color-accent-2)" }))}
            />
          ) : (
            <div className="text-center py-12 text-muted text-sm">
              Belum ada data konten
            </div>
          )}
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Users */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted" />
              <h3 className="text-sm font-semibold text-ink">User Terbaru</h3>
            </div>
            <span className="text-xs text-muted">
              {recentUsers.length} user
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-border-light animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-border-light rounded w-24 animate-pulse" />
                      <div className="h-2 bg-border-light rounded w-32 animate-pulse" />
                    </div>
                  </div>
                ))
              : recentUsers.slice(0, 8).map((user) => (
                  <div
                    key={user.id}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-bg-alt/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs flex-shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {user.name || "Tanpa Nama"}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {user.email}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        user.role === "admin"
                          ? "bg-red-light text-red"
                          : "bg-green-light text-green"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                ))}
            {!loading && recentUsers.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted">
                Belum ada user terdaftar
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted" />
              <h3 className="text-sm font-semibold text-ink">Statistik Cepat</h3>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Tingkat Penyelesaian</span>
              <span className="text-sm font-semibold text-green">{completionRate}%</span>
            </div>
            <div className="w-full h-2 bg-border-light rounded-full overflow-hidden">
              <div className="h-full bg-green rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Progress Records</span>
              <span className="text-sm font-semibold text-accent">{stats?.totalProgress ?? 0}</span>
            </div>
            <div className="w-full h-2 bg-border-light rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: stats?.totalMateri ? `${Math.min((stats.totalProgress / stats.totalMateri) * 100, 100)}%` : "0%" }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">User Aktif Minggu Ini</span>
              <span className="text-sm font-semibold text-blue">{usersThisWeek}</span>
            </div>
            <div className="w-full h-2 bg-border-light rounded-full overflow-hidden">
              <div
                className="h-full bg-blue rounded-full transition-all duration-500"
                style={{ width: stats?.totalUsers ? `${Math.min((usersThisWeek / stats.totalUsers) * 100, 100)}%` : "0%" }}
              />
            </div>

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted">
                Data dihitung dari {recentUsers.length} user terbaru yang tercatat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
