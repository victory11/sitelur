"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "./Toast";
import { useUser } from "./UserContext";

interface TLItem {
  idTl: string;
  idRapat: string;
  nomorRapat: string;
  uraianTindakLanjut: string;
  pic: string;
  unitPelaksana: string;
  deadline: string;
  prioritas: string;
  status: string;
  catatanUpdate: string;
  updatedAt: string;
}

const STATUS_TL = ["Belum Dilaksanakan", "Proses", "Selesai", "Tertunda"];

function PriorBadge({ prioritas }: { prioritas: string }) {
  const colors: Record<string, string> = {
    "Sangat Tinggi": "bg-red-100 text-red-700",
    Tinggi: "bg-orange-100 text-orange-700",
    Sedang: "bg-yellow-100 text-yellow-700",
    Rendah: "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[prioritas] || "bg-gray-100 text-gray-700"}`}>
      {prioritas}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "Belum Dilaksanakan": "bg-gray-100 text-gray-700",
    Proses: "bg-blue-100 text-blue-700",
    Selesai: "bg-green-100 text-green-700",
    Tertunda: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default function TindakLanjutContent() {
  const [tlList, setTlList] = useState<TLItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editCatatan, setEditCatatan] = useState("");
  const { showToast } = useToast();

  const fetchTL = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (deadlineFilter !== "all") params.set("deadline", deadlineFilter);
    fetch(`/api/tindak-lanjut?${params}`)
      .then((r) => r.json())
      .then((d) => setTlList(Array.isArray(d) ? d : []))
      .catch(() => showToast("Gagal memuat data tindak lanjut", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTL();
  }, [statusFilter, deadlineFilter]);

  const handleUpdate = async (idTl: string) => {
    try {
      const res = await fetch(`/api/tindak-lanjut/${idTl}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, catatanUpdate: editCatatan }),
      });
      const result = await res.json();
      if (result.success) {
        showToast("Status berhasil diupdate", "success");
        setEditingId(null);
        fetchTL();
      }
    } catch {
      showToast("Gagal mengupdate status", "error");
    }
  };

  const overdue = tlList.filter(
    (tl) => tl.deadline && new Date(tl.deadline) < new Date() && tl.status !== "Selesai"
  ).length;
  const selesai = tlList.filter((tl) => tl.status === "Selesai").length;
  const proses = tlList.filter((tl) => tl.status === "Proses").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1C2A3A]">Daftar Tindak Lanjut</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor dan kelola tindak lanjut dari setiap rapat</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-[#1A6EB5]">{tlList.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{selesai}</p>
          <p className="text-xs text-gray-500">Selesai</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{proses}</p>
          <p className="text-xs text-gray-500">Proses</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{overdue}</p>
          <p className="text-xs text-gray-500">Overdue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
          >
            <option value="all">Semua Status</option>
            {STATUS_TL.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
          >
            <option value="all">Semua Deadline</option>
            <option value="overdue">Overdue</option>
            <option value="this_week">Minggu ini</option>
            <option value="this_month">Bulan ini</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#1A6EB5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tlList.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📌</p>
            <p className="text-gray-500 font-medium">Tidak ada tindak lanjut</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">No. Rapat</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Uraian</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">PIC</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Deadline</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Prioritas</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tlList.map((tl) => {
                  const isOverdue = tl.deadline && new Date(tl.deadline) < new Date() && tl.status !== "Selesai";
                  return (
                    <tr key={tl.idTl} className={`border-b border-gray-50 transition-colors ${isOverdue ? "bg-red-50/30" : "hover:bg-gray-50/50"}`}>
                      <td className="py-3 px-4">
                        <Link href={`/rapat/${tl.idRapat}`} className="text-[#1A6EB5] hover:underline font-mono text-xs">
                          {tl.nomorRapat || tl.idRapat}
                        </Link>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">{tl.uraianTindakLanjut}</td>
                      <td className="py-3 px-4 text-gray-600">{tl.pic || "-"}</td>
                      <td className="py-3 px-4">
                        <span className={`font-mono text-xs ${isOverdue ? "text-red-600 font-bold" : "text-gray-600"}`}>
                          {tl.deadline ? new Date(tl.deadline).toLocaleDateString("id-ID") : "-"}
                          {isOverdue && " ⚠"}
                        </span>
                      </td>
                      <td className="py-3 px-4"><PriorBadge prioritas={tl.prioritas} /></td>
                      <td className="py-3 px-4"><StatusBadge status={tl.status} /></td>
                      <td className="py-3 px-4">
                        {editingId === tl.idTl ? (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="px-2 py-1 border border-gray-200 rounded text-xs bg-white"
                            >
                              {STATUS_TL.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Catatan..."
                              value={editCatatan}
                              onChange={(e) => setEditCatatan(e.target.value)}
                              className="px-2 py-1 border border-gray-200 rounded text-xs"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleUpdate(tl.idTl)}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs hover:bg-gray-300"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(tl.idTl); setEditStatus(tl.status); setEditCatatan(""); }}
                            className="text-[#1A6EB5] hover:text-[#145a96] text-xs font-medium"
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
