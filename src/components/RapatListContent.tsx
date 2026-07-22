"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "./Toast";

interface RapatItem {
  idRapat: string;
  nomorRapat: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  tempat: string;
  namaRapat: string;
  jenisRapat: string;
  sifatRapat: string;
  statusRapat: string;
  pimpinanRapat: string;
  unitPenyelenggara: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    Berlangsung: "bg-blue-100 text-blue-700",
    Selesai: "bg-green-100 text-green-700",
    Ditutup: "bg-slate-200 text-slate-800",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default function RapatListContent() {
  const [rapatList, setRapatList] = useState<RapatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { showToast } = useToast();

  const fetchRapat = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    fetch(`/api/rapat?${params}`)
      .then((r) => r.json())
      .then((d) => setRapatList(d))
      .catch(() => showToast("Gagal memuat daftar rapat", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRapat();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRapat();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rapat ini?")) return;
    try {
      await fetch(`/api/rapat/${id}`, { method: "DELETE" });
      showToast("Rapat berhasil dihapus", "success");
      fetchRapat();
    } catch {
      showToast("Gagal menghapus rapat", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2A3A]">Daftar Rapat</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan monitor semua rapat RSUD</p>
        </div>
        <Link
          href="/rapat/input"
          className="inline-flex items-center gap-2 bg-[#1A6EB5] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#145a96] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Input Rapat Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama atau nomor rapat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Berlangsung">Berlangsung</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditutup">Ditutup</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1A6EB5] text-white rounded-lg text-sm font-medium hover:bg-[#145a96] transition-colors"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#1A6EB5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rapatList.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 font-medium">Belum ada data rapat</p>
            <p className="text-sm text-gray-400 mt-1">Mulai dengan menginput rapat baru</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nomor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nama Rapat</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tempat</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Jenis</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rapatList.map((r) => (
                  <tr key={r.idRapat} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{r.nomorRapat || "-"}</td>
                    <td className="py-3 px-4">
                      <Link href={`/rapat/${r.idRapat}`} className="font-medium text-[#1A6EB5] hover:underline">
                        {r.namaRapat}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(r.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                      {r.jamMulai?.slice(0, 5)}{r.jamSelesai ? ` - ${r.jamSelesai.slice(0, 5)}` : ""}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{r.tempat || "-"}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{r.jenisRapat || "-"}</td>
                    <td className="py-3 px-4"><StatusBadge status={r.statusRapat} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/rapat/${r.idRapat}`} className="text-[#1A6EB5] hover:text-[#145a96]" title="Detail">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {r.statusRapat === "Draft" && (
                          <Link href={`/rapat/input?edit=${r.idRapat}`} className="text-orange-500 hover:text-orange-600" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                        )}
                        <button onClick={() => handleDelete(r.idRapat)} className="text-red-500 hover:text-red-600" title="Hapus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
