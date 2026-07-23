"use client";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "./Toast";
type Tab = "pegawai" | "tempat" | "unit" | "jenis";
interface Pegawai {
  idPegawai: string;
  namaLengkap: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  email: string;
  noHp: string;
  role: string;
  status: string;
}
interface Tempat {
  idTempat: string;
  namaTempat: string;
  kapasitas: number | null;
  status: string;
}
interface Unit {
  idUnit: string;
  namaUnit: string;
  kepalaUnit: string;
  status: string;
}
interface JenisRapat {
  idJenis: string;
  namaJenis: string;
  kodeSingkat: string;
  status: string;
}
export default function MasterDataContent() {
  const [tab, setTab] = useState<Tab>("pegawai");
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [tempatList, setTempatList] = useState<Tempat[]>([]);
  const [unitList, setUnitList] = useState<Unit[]>([]);
  const [jenisList, setJenisList] = useState<JenisRapat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Record<string, string | number | null> | null>(null);
  const { showToast } = useToast();
  // Form states
  const [formData, setFormData] = useState<Record<string, string>>({});
  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, t, u, j] = await Promise.all([
        fetch("/api/master/pegawai").then((r) => r.json()),
        fetch("/api/master/tempat").then((r) => r.json()),
        fetch("/api/master/unit").then((r) => r.json()),
        fetch("/api/master/jenis-rapat").then((r) => r.json()),
      ]);
      setPegawaiList(p);
      setTempatList(t);
      setUnitList(u);
      setJenisList(j);
    } catch {
      showToast("Gagal memuat data master", "error");
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchAll();
  }, []);
  const openAdd = () => {
    setEditData(null);
    setFormData({});
    setShowModal(true);
  };
  const openEdit = (data: Record<string, string | number | null>) => {
    setEditData(data);
    const fd: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      fd[k] = v != null ? String(v) : "";
    }
    setFormData(fd);
    setShowModal(true);
  };
  const handleSave = async () => {
    try {
      const apiMap: Record<Tab, string> = {
        pegawai: "/api/master/pegawai",
        tempat: "/api/master/tempat",
        unit: "/api/master/unit",
        jenis: "/api/master/jenis-rapat",
      };
      const method = editData ? "PUT" : "POST";
      const res = await fetch(apiMap[tab], {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      showToast(
        editData
          ? "Data berhasil diupdate (termasuk sinkronisasi user)"
          : "Data berhasil ditambahkan",
        "success"
      );
      setShowModal(false);
      fetchAll();
    } catch {
      showToast("Gagal menyimpan data", "error");
    }
  };
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "pegawai", label: "Pegawai", icon: "👤" },
    { key: "tempat", label: "Tempat", icon: "🏢" },
    { key: "unit", label: "Unit Kerja", icon: "🏗️" },
    { key: "jenis", label: "Jenis Rapat", icon: "📋" },
  ];
  const renderFormFields = () => {
    switch (tab) {
      case "pegawai":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
              <input type="text" value={formData.namaLengkap || ""} onChange={(e) => updateField("namaLengkap", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
              <input type="text" value={formData.nip || ""} onChange={(e) => updateField("nip", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
              <input type="text" value={formData.jabatan || ""} onChange={(e) => updateField("jabatan", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja</label>
              <input type="text" value={formData.unitKerja || ""} onChange={(e) => updateField("unitKerja", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email || ""} onChange={(e) => updateField("email", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
              <p className="text-xs text-gray-400 mt-1">Email ini akan otomatis tersinkronisasi dengan akun user</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
              <input type="text" value={formData.noHp || ""} onChange={(e) => updateField("noHp", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={formData.role || "viewer"} onChange={(e) => updateField("role", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="admin">⚡ Admin</option>
                <option value="notulis">📝 Notulis</option>
                <option value="viewer">👁️ Viewer</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Role akan otomatis tersinkronisasi dengan akun user</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status || "Aktif"} onChange={(e) => updateField("status", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </>
        );
      case "tempat":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tempat <span className="text-red-500">*</span></label>
              <input type="text" value={formData.namaTempat || ""} onChange={(e) => updateField("namaTempat", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
              <input type="number" value={formData.kapasitas || ""} onChange={(e) => updateField("kapasitas", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status || "Aktif"} onChange={(e) => updateField("status", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </>
        );
      case "unit":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Unit <span className="text-red-500">*</span></label>
              <input type="text" value={formData.namaUnit || ""} onChange={(e) => updateField("namaUnit", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kepala Unit</label>
              <input type="text" value={formData.kepalaUnit || ""} onChange={(e) => updateField("kepalaUnit", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status || "Aktif"} onChange={(e) => updateField("status", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </>
        );
      case "jenis":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jenis <span className="text-red-500">*</span></label>
              <input type="text" value={formData.namaJenis || ""} onChange={(e) => updateField("namaJenis", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Singkat <span className="text-red-500">*</span></label>
              <input type="text" value={formData.kodeSingkat || ""} onChange={(e) => updateField("kodeSingkat", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status || "Aktif"} onChange={(e) => updateField("status", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </>
        );
    }
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2A3A]">Master Data</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data referensi sistem</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#1A6EB5] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#145a96] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah {tabs.find((t) => t.key === tab)?.label}
        </button>
      </div>
      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${tab === t.key ? "bg-[#1A6EB5] text-white shadow" : "text-gray-600 hover:bg-gray-100"}
            `}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
      {/* Sync info banner for pegawai */}
      {tab === "pegawai" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <span className="text-blue-500">🔄</span>
          <p className="text-xs text-blue-700">
            Data pegawai (email, role, status) akan <strong>otomatis tersinkronisasi</strong> dengan tabel Manajemen User saat disimpan.
          </p>
        </div>
      )}
      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#1A6EB5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {tab === "pegawai" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Jabatan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Unit</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pegawaiList.map((p) => (
                    <tr key={p.idPegawai} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 font-mono text-xs text-gray-500">{p.idPegawai}</td>
                      <td className="py-2.5 px-4 font-medium">{p.namaLengkap}</td>
                      <td className="py-2.5 px-4 text-gray-600">{p.jabatan || "-"}</td>
                      <td className="py-2.5 px-4 text-gray-600">{p.unitKerja || "-"}</td>
                      <td className="py-2.5 px-4 text-gray-600 font-mono text-xs">{p.email || "-"}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.role === "admin" ? "bg-purple-100 text-purple-700" : p.role === "notulis" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                          {p.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <button onClick={() => openEdit(p as unknown as Record<string, string | number | null>)} className="text-[#1A6EB5] hover:underline text-xs font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "tempat" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nama Tempat</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Kapasitas</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tempatList.map((t) => (
                    <tr key={t.idTempat} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 font-mono text-xs text-gray-500">{t.idTempat}</td>
                      <td className="py-2.5 px-4 font-medium">{t.namaTempat}</td>
                      <td className="py-2.5 px-4 text-gray-600">{t.kapasitas || "-"}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{t.status}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <button onClick={() => openEdit(t as unknown as Record<string, string | number | null>)} className="text-[#1A6EB5] hover:underline text-xs font-medium">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "unit" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nama Unit</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Kepala Unit</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {unitList.map((u) => (
                    <tr key={u.idUnit} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 font-mono text-xs text-gray-500">{u.idUnit}</td>
                      <td className="py-2.5 px-4 font-medium">{u.namaUnit}</td>
                      <td className="py-2.5 px-4 text-gray-600">{u.kepalaUnit || "-"}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{u.status}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <button onClick={() => openEdit(u as unknown as Record<string, string | number | null>)} className="text-[#1A6EB5] hover:underline text-xs font-medium">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "jenis" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nama Jenis</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Kode</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jenisList.map((j) => (
                    <tr key={j.idJenis} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 font-mono text-xs text-gray-500">{j.idJenis}</td>
                      <td className="py-2.5 px-4 font-medium">{j.namaJenis}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-[#1A6EB5] rounded text-xs font-mono font-bold">{j.kodeSingkat}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${j.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{j.status}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <button onClick={() => openEdit(j as unknown as Record<string, string | number | null>)} className="text-[#1A6EB5] hover:underline text-xs font-medium">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#1C2A3A]">
                {editData ? "Edit" : "Tambah"} {tabs.find((t) => t.key === tab)?.label}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-4">
              {renderFormFields()}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#1A6EB5] text-white rounded-lg text-sm font-medium hover:bg-[#145a96]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
