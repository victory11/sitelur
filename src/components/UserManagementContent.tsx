"use client";
import { useEffect, useState } from "react";
import { useToast } from "./Toast";
interface UserItem {
  idUser: string;
  email: string;
  nama: string;
  role: string;
  idPegawai: string | null;
  lastLogin: string | null;
  status: string;
}
const ROLES = [
  { value: "admin", label: "Admin", color: "bg-purple-100 text-purple-700", icon: "⚡" },
  { value: "notulis", label: "Notulis", color: "bg-blue-100 text-blue-700", icon: "📝" },
  { value: "viewer", label: "Viewer", color: "bg-gray-100 text-gray-700", icon: "👁️" },
];
export default function UserManagementContent() {
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { showToast } = useToast();
  // Password modal
  const [pwModal, setPwModal] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  // Role edit modal
  const [editModal, setEditModal] = useState<UserItem | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUserList(Array.isArray(d) ? d : []))
      .catch(() => showToast("Gagal memuat data user", "error"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const filteredUsers = userList.filter((u) => {
    const matchSearch =
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });
  const handleChangePassword = async () => {
    if (!pwModal) return;
    if (newPassword.length < 6) {
      showToast("Password minimal 6 karakter", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Password dan konfirmasi tidak sama", "error");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: pwModal.idUser,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Password ${pwModal.nama} berhasil diubah`, "success");
        setPwModal(null);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(data.error || "Gagal mengubah password", "error");
      }
    } catch {
      showToast("Gagal mengubah password", "error");
    }
    setPwSaving(false);
  };
  const handleUpdateUser = async () => {
    if (!editModal) return;
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUser: editModal.idUser,
          role: editRole,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`User ${editModal.nama} berhasil diupdate`, "success");
        setEditModal(null);
        fetchUsers();
      } else {
        showToast(data.error || "Gagal mengupdate user", "error");
      }
    } catch {
      showToast("Gagal mengupdate user", "error");
    }
  };
  const openEditModal = (user: UserItem) => {
    setEditModal(user);
    setEditRole(user.role);
    setEditStatus(user.status);
  };
  const getRoleInfo = (role: string) =>
    ROLES.find((r) => r.value === role) || ROLES[2];
  const totalAdmin = userList.filter((u) => u.role === "admin").length;
  const totalNotulis = userList.filter((u) => u.role === "notulis").length;
  const totalViewer = userList.filter((u) => u.role === "viewer").length;
  const totalAktif = userList.filter((u) => u.status === "Aktif").length;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1C2A3A]">Manajemen User</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola akun, role, dan password pengguna sistem</p>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-[#1A6EB5]">{userList.length}</p>
          <p className="text-xs text-gray-500">Total User</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-purple-600">{totalAdmin}</p>
          <p className="text-xs text-gray-500">⚡ Admin</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-blue-600">{totalNotulis}</p>
          <p className="text-xs text-gray-500">📝 Notulis</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-green-600">{totalAktif}</p>
          <p className="text-xs text-gray-500">✅ Aktif</p>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
          >
            <option value="all">Semua Role</option>
            <option value="admin">⚡ Admin</option>
            <option value="notulis">📝 Notulis</option>
            <option value="viewer">👁️ Viewer</option>
          </select>
        </div>
      </div>
      {/* Role info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold text-blue-800 mb-2">📋 Aturan Akses per Role:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="font-bold text-purple-700 mb-1">⚡ Admin</p>
            <p className="text-gray-600">Dashboard, Daftar Rapat, Tindak Lanjut, Master Data, Manajemen User</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="font-bold text-blue-700 mb-1">📝 Notulis</p>
            <p className="text-gray-600">Dashboard, Daftar Rapat, Tindak Lanjut</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="font-bold text-gray-700 mb-1">👁️ Viewer</p>
            <p className="text-gray-600">Dashboard saja</p>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#1A6EB5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-gray-500">Tidak ada user yang ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Login Terakhir</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const ri = getRoleInfo(u.role);
                  return (
                    <tr key={u.idUser} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${u.role === "admin" ? "bg-purple-500" : u.role === "notulis" ? "bg-blue-500" : "bg-gray-400"}`}>
                            {u.nama[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{u.nama}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ri.color}`}>
                          {ri.icon} {ri.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "Belum pernah"
                        }
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(u)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1A6EB5] rounded-lg text-xs font-medium transition-colors"
                            title="Edit Role & Status"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => { setPwModal(u); setNewPassword(""); setConfirmPassword(""); }}
                            className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-medium transition-colors"
                            title="Ganti Password"
                          >
                            🔑 Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Password Modal */}
      {pwModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPwModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#1C2A3A]">🔑 Ganti Password</h3>
              <button onClick={() => setPwModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-800">{pwModal.nama}</p>
              <p className="text-xs text-gray-500">{pwModal.email}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Password tidak sama</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setPwModal(null)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                Batal
              </button>
              <button
                onClick={handleChangePassword}
                disabled={pwSaving || newPassword.length < 6 || newPassword !== confirmPassword}
                className="px-4 py-2 bg-[#1A6EB5] text-white rounded-lg text-sm font-medium hover:bg-[#145a96] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pwSaving ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Role Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#1C2A3A]">✏️ Edit User</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-800">{editModal.nama}</p>
              <p className="text-xs text-gray-500">{editModal.email}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setEditRole(r.value)}
                      className={`px-3 py-3 rounded-lg text-xs font-medium border-2 transition-all text-center
                        ${editRole === r.value
                          ? "border-[#1A6EB5] bg-blue-50 text-[#1A6EB5] shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }
                      `}
                    >
                      <span className="text-lg block mb-1">{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
                >
                  <option value="Aktif">✅ Aktif</option>
                  <option value="Non-Aktif">❌ Non-Aktif</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleUpdateUser} className="px-4 py-2 bg-[#1A6EB5] text-white rounded-lg text-sm font-medium hover:bg-[#145a96]">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}