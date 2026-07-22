"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "./UserContext";

interface DashboardData {
  totalRapat: number;
  rapatByStatus: { status: string; count: number }[];
  rapatByJenis: { jenis: string; count: number }[];
  rapatByUnit: { unit: string; count: number }[];
  totalTL: number;
  tlByStatus: { status: string; count: number }[];
  tlOverdue: number;
  tlByPrioritas: { prioritas: string; count: number }[];
  recentRapat: {
    idRapat: string;
    namaRapat: string;
    tanggal: string;
    statusRapat: string;
    jenisRapat: string;
    nomorRapat: string;
  }[];
}

function StatCard({
  label,
  value,
  icon,
  color,
  subtext,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  subtext?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color.replace("text-", "bg-").replace("700", "50").replace("600", "50").replace("500", "50")}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    Berlangsung: "bg-blue-100 text-blue-700",
    Selesai: "bg-green-100 text-green-700",
    Ditutup: "bg-slate-200 text-slate-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function BarChart({ data, colorFn }: { data: { label: string; value: number }[]; colorFn: (label: string) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-32 truncate text-right">{item.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full rounded-full flex items-center px-2 text-xs font-medium text-white transition-all ${colorFn(item.label)}`}
              style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }}
            >
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1A6EB5] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Gagal memuat data dashboard</div>;
  }

  const getStatusCount = (status: string) =>
    data.rapatByStatus.find((s) => s.status === status)?.count || 0;
  const getTLStatusCount = (status: string) =>
    data.tlByStatus.find((s) => s.status === status)?.count || 0;

  const tlStatusColor = (label: string) => {
    switch (label) {
      case "Belum Dilaksanakan": return "bg-gray-500";
      case "Proses": return "bg-blue-500";
      case "Selesai": return "bg-green-500";
      case "Tertunda": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 bg-gradient-to-r from-[#1A6EB5] to-[#145a96] text-white rounded-2xl p-5 sm:p-6 shadow-md">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <p className="text-xs text-blue-100 uppercase tracking-wider font-medium">
        {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1">
        Selamat datang, {user?.nama?.split(",")[0] || "User"}! 👋
      </h1>
      <p className="text-sm text-blue-100 mt-1">
        {user?.role === "admin" && "Anda memiliki akses penuh untuk mengelola sistem SITELUR."}
        {user?.role === "notulis" && "Anda dapat menginput dan mengelola rapat serta tindak lanjut."}
        {user?.role === "viewer" && "Anda dapat melihat semua data rapat dan tindak lanjut."}
      </p>
    </div>
    {(user?.role === "admin" || user?.role === "notulis") && (
      <Link href="/rapat/input" className="inline-flex items-center gap-2 bg-white text-[#1A6EB5] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors shadow-md whitespace-nowrap">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Input Rapat Baru
      </Link>
    )}
  </div>
</div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* TL Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Tindak Lanjut</h3>
          {data.tlByStatus.length > 0 ? (
            <BarChart
              data={data.tlByStatus.map((s) => ({ label: s.status, value: s.count }))}
              colorFn={tlStatusColor}
            />
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada data tindak lanjut</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-xs text-gray-500">Belum ({getTLStatusCount("Belum Dilaksanakan")})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-500">Proses ({getTLStatusCount("Proses")})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">Selesai ({getTLStatusCount("Selesai")})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-500">Tertunda ({getTLStatusCount("Tertunda")})</span>
            </div>
          </div>
        </div>

        {/* Rapat by Jenis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Rapat per Jenis</h3>
          {data.rapatByJenis.length > 0 ? (
            <BarChart
              data={data.rapatByJenis.filter(j => j.jenis).map((j) => ({ label: j.jenis || "Lainnya", value: j.count }))}
              colorFn={() => "bg-[#1A6EB5]"}
            />
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada data rapat</p>
          )}
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Rapat Terbaru</h3>
          <Link href="/rapat" className="text-xs text-[#1A6EB5] hover:underline font-medium">
            Lihat Semua →
          </Link>
        </div>
        {data.recentRapat.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Nomor</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Nama Rapat</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Jenis</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRapat.map((r) => (
                  <tr key={r.idRapat} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-mono text-xs text-gray-600">{r.nomorRapat}</td>
                    <td className="py-2.5 px-3 font-medium">{r.namaRapat}</td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {new Date(r.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{r.jenisRapat || "-"}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={r.statusRapat} /></td>
                    <td className="py-2.5 px-3">
                      <Link href={`/rapat/${r.idRapat}`} className="text-[#1A6EB5] hover:underline text-xs font-medium">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-3">Belum ada rapat yang tercatat</p>
            <Link
              href="/rapat/input"
              className="inline-flex items-center gap-2 bg-[#1A6EB5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#145a96] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Input Rapat Baru
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
