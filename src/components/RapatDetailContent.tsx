"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useToast } from "./Toast";
import { useUser } from "./UserContext";

interface TLItem {
  idTl: string;
  uraianTindakLanjut: string;
  pic: string;
  unitPelaksana: string;
  deadline: string;
  prioritas: string;
  status: string;
  catatanUpdate: string;
}

interface RapatData {
  idRapat: string;
  nomorRapat: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  tempat: string;
  namaRapat: string;
  jenisRapat: string;
  sifatRapat: string;
  metodeRapat: string;
  kategoriAgenda: string;
  pimpinanRapat: string;
  notulis: string;
  unitPenyelenggara: string;
  peserta: string[];
  agendaRapat: string;
  pembahasanRapat: string;
  keputusanRapat: string;
  statusRapat: string;
  createdAt: string;
  tindakLanjutList: TLItem[];
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    Berlangsung: "bg-blue-100 text-blue-700",
    Selesai: "bg-green-100 text-green-700",
    Ditutup: "bg-slate-200 text-slate-800",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function PrioridBadge({ prioritas }: { prioritas: string }) {
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

function TLStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "Belum Dilaksanakan": "bg-gray-100 text-gray-700",
    Proses: "bg-blue-100 text-blue-700",
    Selesai: "bg-green-100 text-green-700",
    Tertunda: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider sm:w-40 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{value || "-"}</span>
    </div>
  );
}

export default function RapatDetailContent({ id }: { id: string }) {
  const [data, setData] = useState<RapatData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useUser();
  const canEdit = user?.role === "admin" || user?.role === "notulis";

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/rapat/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => showToast("Gagal memuat detail rapat", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !data) return;

    const pesertaList = (data.peserta || []).map((p, i) => `<li>${p}</li>`).join("");
    const tlRows = (data.tindakLanjutList || [])
      .map(
        (tl, i) => `<tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${tl.uraianTindakLanjut}</td>
          <td>${tl.pic || "-"}</td>
          <td>${tl.unitPelaksana || "-"}</td>
          <td>${tl.deadline ? new Date(tl.deadline).toLocaleDateString("id-ID") : "-"}</td>
          <td>${tl.prioritas || "-"}</td>
          <td>${tl.status}</td>
        </tr>`
      )
      .join("");

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Notulen Rapat - ${data.nomorRapat}</title>
<style>
  body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; font-size: 12pt; }
  .header { text-align: center; border-bottom: 3px double #1A6EB5; padding-bottom: 15px; margin-bottom: 20px; }
  .header h2 { color: #1A6EB5; margin: 5px 0; }
  .header h3 { margin: 5px 0; font-size: 14pt; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  .info-table td { padding: 4px 8px; vertical-align: top; font-size: 11pt; }
  .info-table td:first-child { width: 180px; font-weight: bold; }
  .data-table th, .data-table td { border: 1px solid #333; padding: 6px 8px; text-align: left; font-size: 10pt; }
  .data-table th { background: #f0f0f0; }
  .section-title { background: #1A6EB5; color: white; padding: 6px 12px; margin: 20px 0 10px; font-weight: bold; font-size: 11pt; }
  .content { padding: 0 10px; white-space: pre-wrap; line-height: 1.6; font-size: 11pt; }
  .signature { display: flex; justify-content: space-between; margin-top: 50px; }
  .signature div { text-align: center; width: 200px; }
  .signature .line { margin-top: 80px; border-top: 1px solid #333; }
  @media print { body { padding: 20px; } }
</style>
</head><body>
<div class="header">
  <h2>🏥 RSUD</h2>
  <h3>NOTULEN RAPAT</h3>
</div>

<table class="info-table">
  <tr><td>Nomor Rapat</td><td>: ${data.nomorRapat || "-"}</td></tr>
  <tr><td>Nama Rapat</td><td>: ${data.namaRapat}</td></tr>
  <tr><td>Tanggal</td><td>: ${data.tanggal ? new Date(data.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-"}</td></tr>
  <tr><td>Waktu</td><td>: ${data.jamMulai?.slice(0, 5) || "-"} - ${data.jamSelesai?.slice(0, 5) || "-"} WIB</td></tr>
  <tr><td>Tempat</td><td>: ${data.tempat || "-"}</td></tr>
  <tr><td>Jenis Rapat</td><td>: ${data.jenisRapat || "-"}</td></tr>
  <tr><td>Sifat Rapat</td><td>: ${data.sifatRapat || "-"}</td></tr>
  <tr><td>Metode</td><td>: ${data.metodeRapat || "-"}</td></tr>
  <tr><td>Pimpinan Rapat</td><td>: ${data.pimpinanRapat || "-"}</td></tr>
  <tr><td>Notulis</td><td>: ${data.notulis || "-"}</td></tr>
  <tr><td>Unit Penyelenggara</td><td>: ${data.unitPenyelenggara || "-"}</td></tr>
</table>

<div class="section-title">DAFTAR PESERTA</div>
<ol style="padding-left:20px; font-size:11pt; line-height: 1.8">${pesertaList || "<li>-</li>"}</ol>

<div class="section-title">AGENDA RAPAT</div>
<div class="content">${data.agendaRapat || "-"}</div>

<div class="section-title">PEMBAHASAN</div>
<div class="content">${data.pembahasanRapat || "-"}</div>

<div class="section-title">KEPUTUSAN RAPAT</div>
<div class="content">${data.keputusanRapat || "-"}</div>

<div class="section-title">DAFTAR TINDAK LANJUT</div>
<table class="data-table">
  <thead><tr><th>No</th><th>Uraian</th><th>PIC</th><th>Unit</th><th>Deadline</th><th>Prioritas</th><th>Status</th></tr></thead>
  <tbody>${tlRows || "<tr><td colspan='7' style='text-align:center'>Tidak ada tindak lanjut</td></tr>"}</tbody>
</table>

<div class="signature">
  <div><p>Notulis,</p><div class="line"></div><p><strong>${data.notulis || "________________"}</strong></p></div>
  <div><p>Pimpinan Rapat,</p><div class="line"></div><p><strong>${data.pimpinanRapat || "________________"}</strong></p></div>
</div>

<hr style="margin-top: 40px;">
<p style="font-size: 9pt; color: #888; text-align: center;">Dicetak dari SITELUR — ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1A6EB5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Rapat tidak ditemukan</p>
        <Link href="/rapat" className="text-[#1A6EB5] hover:underline text-sm mt-2 inline-block">
          ← Kembali ke Daftar Rapat
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/rapat" className="text-[#1A6EB5] hover:underline text-sm">← Daftar Rapat</Link>
          </div>
          <h1 className="text-2xl font-bold text-[#1C2A3A]">{data.namaRapat}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={data.statusRapat} />
            <span className="text-sm text-gray-500 font-mono">{data.nomorRapat}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {data.statusRapat === "Draft" && (
            <Link
              href={`/rapat/input?edit=${data.idRapat}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              ✏️ Edit
            </Link>
          )}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A6EB5] text-white rounded-lg text-sm font-medium hover:bg-[#145a96] transition-colors"
          >
            🖨️ Cetak Notulen
          </button>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" ref={printRef}>
        {/* Identitas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            📋 Identitas Rapat
          </h3>
          <div className="divide-y divide-gray-50">
            <InfoRow label="Tanggal" value={data.tanggal ? new Date(data.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : null} />
            <InfoRow label="Waktu" value={`${data.jamMulai?.slice(0, 5) || "-"} — ${data.jamSelesai?.slice(0, 5) || "-"} WIB`} />
            <InfoRow label="Tempat" value={data.tempat} />
            <InfoRow label="Jenis" value={data.jenisRapat} />
            <InfoRow label="Sifat" value={data.sifatRapat} />
            <InfoRow label="Metode" value={data.metodeRapat} />
            <InfoRow label="Kategori" value={data.kategoriAgenda} />
            <InfoRow label="Pimpinan" value={data.pimpinanRapat} />
            <InfoRow label="Notulis" value={data.notulis} />
            <InfoRow label="Unit" value={data.unitPenyelenggara} />
          </div>
        </div>

        {/* Peserta */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            👥 Peserta Rapat ({(data.peserta || []).length} orang)
          </h3>
          {(data.peserta || []).length > 0 ? (
            <div className="space-y-1.5">
              {data.peserta.map((p, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 rounded-lg text-sm">
                  <span className="w-6 h-6 bg-[#1A6EB5] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  {p}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Belum ada peserta</p>
          )}
        </div>
      </div>

      {/* Konten Rapat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          📝 Konten Rapat
        </h3>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Agenda Rapat</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">{data.agendaRapat || "-"}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pembahasan</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">{data.pembahasanRapat || "-"}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Keputusan</label>
            <div className="mt-1 p-3 bg-blue-50 rounded-lg text-sm whitespace-pre-wrap font-medium">{data.keputusanRapat || "-"}</div>
          </div>
        </div>
      </div>

      {/* Tindak Lanjut */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          📌 Daftar Tindak Lanjut ({(data.tindakLanjutList || []).length})
        </h3>
        {(data.tindakLanjutList || []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">No</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Uraian</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">PIC</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Unit</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Deadline</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Prioritas</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.tindakLanjutList.map((tl, i) => (
                  <tr key={tl.idTl} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                    <td className="py-2.5 px-3 max-w-xs">{tl.uraianTindakLanjut}</td>
                    <td className="py-2.5 px-3 text-gray-600">{tl.pic || "-"}</td>
                    <td className="py-2.5 px-3 text-gray-600">{tl.unitPelaksana || "-"}</td>
                    <td className="py-2.5 px-3 text-gray-600 font-mono text-xs">
                      {tl.deadline ? new Date(tl.deadline).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-2.5 px-3"><PrioridBadge prioritas={tl.prioritas} /></td>
                    <td className="py-2.5 px-3"><TLStatusBadge status={tl.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Tidak ada tindak lanjut</p>
        )}
      </div>
    </div>
  );
}
