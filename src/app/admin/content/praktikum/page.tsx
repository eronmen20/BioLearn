"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, Column } from "@/components/admin/data-table";
import { Modal } from "@/components/admin/modal";
import { FlaskConical, Eye, Edit, Trash2 } from "lucide-react";
import { showToast } from "@/components/ui/toaster";

interface PraktikumItem {
  id: string;
  bab: string;
  title: string;
  description: string;
  status: "draft" | "published";
  created_at: string;
}

export default function PraktikumPage() {
  const [data] = useState<PraktikumItem[]>([]);
  const [loading] = useState(false);

  const columns: Column<PraktikumItem>[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "bab", label: "Bab", sortable: true },
    { key: "title", label: "Judul", sortable: true },
    { key: "description", label: "Deskripsi" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            row.status === "published"
              ? "bg-green-light text-green"
              : "bg-yellow/10 text-yellow"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { key: "created_at", label: "Dibuat", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Praktikum"
        description="Kelola praktikum biologi"
        action={{
          label: "Tambah Praktikum",
          onClick: () => showToast("Coming soon"),
        }}
      />

      <DataTable
        columns={columns}
        data={data as any}
        loading={loading}
        searchPlaceholder="Cari praktikum..."
        emptyMessage="Belum ada praktikum"
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => showToast("Detail praktikum")}
              className="p-1.5 rounded-lg hover:bg-bg-alt text-muted"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast("Edit praktikum")}
              className="p-1.5 rounded-lg hover:bg-bg-alt text-muted"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast("Hapus praktikum")}
              className="p-1.5 rounded-lg hover:bg-red/5 text-red"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}
