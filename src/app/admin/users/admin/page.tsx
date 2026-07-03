'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { ConfirmDialog } from '@/components/admin/modal';
import { Users, Shield, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  email_verified: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: 'admin', page: String(page), limit: '50' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await fetch(`/api/admin/users?id=${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchUsers();
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditRole = async () => {
    if (!editTarget || !editRole) return;
    setActionLoading(true);
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editTarget.id, role: editRole }),
      });
      setEditTarget(null);
      fetchUsers();
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Nama',
      render: (u) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444] text-sm font-semibold">
            <Shield size={14} />
          </div>
          <span className="font-medium text-gray-900">{u.name || '-'}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'email_verified',
      label: 'Verifikasi',
      render: (u) => u.email_verified
        ? <span className="inline-flex items-center gap-1 text-xs text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full"><CheckCircle size={12} /> Terverifikasi</span>
        : <span className="inline-flex items-center gap-1 text-xs text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded-full"><XCircle size={12} /> Belum</span>,
    },
    {
      key: 'created_at',
      label: 'Terdaftar',
      render: (u) => new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
    {
      key: 'id' as any,
      label: 'Aksi',
      render: (u) => (
        <div className="flex gap-1">
          <button onClick={() => { setEditTarget(u); setEditRole(u.role); }} className="p-1.5 rounded hover:bg-[#3b82f6]/10 text-[#3b82f6]" title="Edit Role"><Edit3 size={15} /></button>
          <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded hover:bg-[#ef4444]/10 text-[#ef4444]" title="Hapus"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Admin"
        description="Kelola akun administrator sistem"
      />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users size={16} />
          <span>{total} admin terdaftar</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Cari admin..."
        emptyMessage="Tidak ditemukan admin yang cocok"
      />

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Role — {editTarget.name}</h3>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#6c5ce7] outline-none"
            >
              <option value="user">Siswa</option>
              <option value="guru">Guru</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Batal</button>
              <button onClick={handleEditRole} disabled={actionLoading} className="px-4 py-2 text-sm rounded-lg bg-[#6c5ce7] text-white hover:bg-[#5b4bd6] disabled:opacity-50">
                {actionLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Admin"
        message={`Yakin ingin menghapus akun admin "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={actionLoading}
      />
    </div>
  );
}
