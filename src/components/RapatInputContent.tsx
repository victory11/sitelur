"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "./Toast";

interface MasterData {
  pegawai: { idPegawai: string; namaLengkap: string; jabatan: string; unitKerja: string }[];
  tempat: { idTempat: string; namaTempat: string }[];
  unit: { idUnit: string; namaUnit: string }[];
  jenisRapat: { idJenis: string; namaJenis: string; kodeSingkat: string }[];
}

interface TindakLanjutRow {
  id: string;
  uraian: string;
  pic: string;
  unitPelaksana: string;
  deadline: string;
  prioritas: string;
}

const SIFAT_RAPAT = ["Rutin", "Insidental", "Mendesak"];
const METODE_RAPAT = ["Luring", "Daring", "Hybrid"];
const KATEGORI_AGENDA = ["Pelayanan", "SDM", "Keuangan", "Sarana Prasarana", "Mutu", "Pendidikan", "BPJS", "Akreditasi", "Lainnya"];
const PRIORITAS = ["Sangat Tinggi", "Tinggi", "Sedang", "Rendah"];

function FormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { showToast } = useToast();

  const [master, setMaster] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jamMulai, setJamMulai] = useState("08:00");
  const [jamSelesai, setJamSelesai] = useState("10:00");
  const [tempat, setTempat] = useState("");
  const [namaRapat, setNamaRapat] = useState("");
  const [jenisRapat, setJenisRapat] = useState("");
  const [sifatRapat, setSifatRapat] = useState("Rutin");
  const [metodeRapat, setMetodeRapat] = useState("Luring");
  const [kategoriAgenda, setKategoriAgenda] = useState("");
  const [pimpinanRapat, setPimpinanRapat] = useState("");
  const [notulis, setNotulis] = useState("");
  const [unitPenyelenggara, setUnitPenyelenggara] = useState("");
  const [peserta, setPeserta] = useState<string[]>([]);
  const [agendaRapat, setAgendaRapat] = useState("");
  const [pembahasanRapat, setPembahasanRapat] = useState("");
  const [keputusanRapat, setKeputusanRapat] = useState("");
  const [tindakLanjutRows, setTindakLanjutRows] = useState<TindakLanjutRow[]>([]);
  const [pesertaSearch, setPesertaSearch] = useState("");
  const [showPesertaDropdown, setShowPesertaDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/master")
      .then((r) => r.json())
      .then((d) => setMaster(d))
      .catch(() => showToast("Gagal memuat data master", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editId && master) {
      fetch(`/api/rapat/${editId}`)
        .then((r) => r.json())
        .then((d) => {
          setTanggal(d.tanggal || "");
          setJamMulai(d.jamMulai?.slice(0, 5) || "08:00");
          setJamSelesai(d.jamSelesai?.slice(0, 5) || "10:00");
          setTempat(d.tempat || "");
          setNamaRapat(d.namaRapat || "");
          setJenisRapat(d.jenisRapat || "");
          setSifatRapat(d.sifatRapat || "Rutin");
          setMetodeRapat(d.metodeRapat || "Luring");
          setKategoriAgenda(d.kategoriAgenda || "");
          setPimpinanRapat(d.pimpinanRapat || "");
          setNotulis(d.notulis || "");
          setUnitPenyelenggara(d.unitPenyelenggara || "");
          setPeserta(d.peserta || []);
          setAgendaRapat(d.agendaRapat || "");
          setPembahasanRapat(d.pembahasanRapat || "");
          setKeputusanRapat(d.keputusanRapat || "");
          if (d.tindakLanjutList) {
            setTindakLanjutRows(
              d.tindakLanjutList.map((tl: { idTl: string; uraianTindakLanjut: string; pic: string; unitPelaksana: string; deadline: string; prioritas: string }) => ({
                id: tl.idTl,
                uraian: tl.uraianTindakLanjut,
                pic: tl.pic || "",
                unitPelaksana: tl.unitPelaksana || "",
                deadline: tl.deadline || "",
                prioritas: tl.prioritas || "Sedang",
              }))
            );
          }
        })
        .catch(() => showToast("Gagal memuat data rapat", "error"));
    }
  }, [editId, master]);

  const validate = (isDraft: boolean): boolean => {
    const newErrors: Record<string, string> = {};
    if (!namaRapat || namaRapat.length < 5) newErrors.namaRapat = "Nama rapat minimal 5 karakter";
    if (!tanggal) newErrors.tanggal = "Tanggal wajib diisi";
    if (!jamMulai) newErrors.jamMulai = "Jam mulai wajib diisi";

    if (!isDraft) {
      if (!pimpinanRapat) newErrors.pimpinanRapat = "Pimpinan rapat wajib diisi";
      if (!notulis) newErrors.notulis = "Notulis wajib diisi";
      if (!agendaRapat || agendaRapat.length < 20) newErrors.agendaRapat = "Agenda rapat minimal 20 karakter";
      if (!jenisRapat) newErrors.jenisRapat = "Jenis rapat wajib diisi";
    }

    if (jamSelesai && jamMulai && jamSelesai <= jamMulai) {
      newErrors.jamSelesai = "Jam selesai harus lebih dari jam mulai";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (statusRapat: string) => {
    const isDraft = statusRapat === "Draft";
    if (!validate(isDraft)) {
      showToast("Mohon perbaiki kesalahan pada form", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tanggal,
        jamMulai,
        jamSelesai,
        tempat,
        namaRapat,
        jenisRapat,
        sifatRapat,
        metodeRapat,
        kategoriAgenda,
        pimpinanRapat,
        notulis,
        unitPenyelenggara,
        peserta,
        agendaRapat,
        pembahasanRapat,
        keputusanRapat,
        statusRapat,
        tindakLanjut: tindakLanjutRows.map((tl) => ({
          uraian: tl.uraian,
          pic: tl.pic,
          unitPelaksana: tl.unitPelaksana,
          deadline: tl.deadline,
          prioritas: tl.prioritas,
        })),
      };

      let res;
      if (editId) {
        res = await fetch(`/api/rapat/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/rapat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();
      if (result.success || result.idRapat || result.data) {
        showToast(
          isDraft
            ? "Draft berhasil disimpan"
            : "Rapat berhasil difinalisasi",
          "success"
        );
        router.push("/rapat");
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      showToast("Gagal menyimpan rapat", "error");
    } finally {
      setSaving(false);
    }
  };

  const addTindakLanjut = () => {
    setTindakLanjutRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        uraian: "",
        pic: "",
        unitPelaksana: "",
        deadline: "",
        prioritas: "Sedang",
      },
    ]);
  };

  const removeTindakLanjut = (id: string) => {
    setTindakLanjutRows((prev) => prev.filter((tl) => tl.id !== id));
  };

  const updateTindakLanjut = (id: string, field: keyof TindakLanjutRow, value: string) => {
    setTindakLanjutRows((prev) =>
      prev.map((tl) => (tl.id === id ? { ...tl, [field]: value } : tl))
    );
  };

  const togglePeserta = (nama: string) => {
    setPeserta((prev) =>
      prev.includes(nama) ? prev.filter((p) => p !== nama) : [...prev, nama]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1A6EB5] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Memuat data master...</span>
        </div>
      </div>
    );
  }

  const filteredPegawai = master?.pegawai.filter(
    (p) =>
      p.namaLengkap.toLowerCase().includes(pesertaSearch.toLowerCase()) ||
      p.jabatan?.toLowerCase().includes(pesertaSearch.toLowerCase())
  ) || [];

  const prioritasColor: Record<string, string> = {
    "Sangat Tinggi": "border-l-red-500 bg-red-50/30",
    Tinggi: "border-l-orange-500 bg-orange-50/30",
    Sedang: "border-l-yellow-500 bg-yellow-50/30",
    Rendah: "border-l-green-500 bg-green-50/30",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1C2A3A]">
          {editId ? "Edit Rapat" : "Input Rapat Baru"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {editId ? "Edit data rapat yang sudah ada" : "Isi formulir untuk mencatat rapat baru"}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2">
          {[
            { n: 1, label: "Identitas Rapat" },
            { n: 2, label: "Konten Rapat" },
            { n: 3, label: "Tindak Lanjut" },
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => setStep(s.n)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${step === s.n
                  ? "bg-[#1A6EB5] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${step === s.n ? "bg-white/20 text-white" : "bg-gray-300 text-gray-600"}
              `}>
                {s.n}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium text-sm mb-2">Mohon perbaiki kesalahan berikut:</p>
          <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
            {Object.values(errors).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Identitas */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#1C2A3A] mb-5 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#1A6EB5] text-white rounded-lg flex items-center justify-center text-sm">1</span>
            Identitas Rapat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal Rapat <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none ${errors.tanggal ? "border-red-400" : "border-gray-200"}`}
              />
            </div>

            {/* Jam Mulai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jam Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none ${errors.jamMulai ? "border-red-400" : "border-gray-200"}`}
              />
            </div>

            {/* Jam Selesai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Selesai</label>
              <input
                type="time"
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none ${errors.jamSelesai ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.jamSelesai && <p className="text-red-500 text-xs mt-1">{errors.jamSelesai}</p>}
            </div>

            {/* Tempat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tempat</label>
              <select
                value={tempat}
                onChange={(e) => setTempat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
              >
                <option value="">-- Pilih Tempat --</option>
                {master?.tempat.map((t) => (
                  <option key={t.idTempat} value={t.namaTempat}>{t.namaTempat}</option>
                ))}
              </select>
            </div>

            {/* Nama Rapat */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Rapat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={namaRapat}
                onChange={(e) => setNamaRapat(e.target.value)}
                placeholder="Contoh: Coffee Morning Direksi"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none ${errors.namaRapat ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.namaRapat && <p className="text-red-500 text-xs mt-1">{errors.namaRapat}</p>}
            </div>

            {/* Jenis Rapat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jenis Rapat <span className="text-red-500">*</span>
              </label>
              <select
                value={jenisRapat}
                onChange={(e) => setJenisRapat(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none ${errors.jenisRapat ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">-- Pilih Jenis --</option>
                {master?.jenisRapat.map((j) => (
                  <option key={j.idJenis} value={j.namaJenis}>{j.namaJenis} ({j.kodeSingkat})</option>
                ))}
              </select>
            </div>

            {/* Sifat Rapat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sifat Rapat</label>
              <select
                value={sifatRapat}
                onChange={(e) => setSifatRapat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
              >
                {SIFAT_RAPAT.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Metode Rapat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Metode Rapat</label>
              <select
                value={metodeRapat}
                onChange={(e) => setMetodeRapat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
              >
                {METODE_RAPAT.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Kategori Agenda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Agenda</label>
              <select
                value={kategoriAgenda}
                onChange={(e) => setKategoriAgenda(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
              >
                <option value="">-- Pilih Kategori --</option>
                {KATEGORI_AGENDA.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Pimpinan Rapat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Pimpinan Rapat <span className="text-red-500">*</span>
              </label>
              <select
                value={pimpinanRapat}
                onChange={(e) => setPimpinanRapat(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none ${errors.pimpinanRapat ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">-- Pilih Pimpinan --</option>
                {master?.pegawai.map((p) => (
                  <option key={p.idPegawai} value={p.namaLengkap}>
                    {p.namaLengkap} — {p.jabatan}
                  </option>
                ))}
              </select>
            </div>

            {/* Notulis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notulis <span className="text-red-500">*</span>
              </label>
              <select
                value={notulis}
                onChange={(e) => setNotulis(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none ${errors.notulis ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">-- Pilih Notulis --</option>
                {master?.pegawai.map((p) => (
                  <option key={p.idPegawai} value={p.namaLengkap}>
                    {p.namaLengkap} — {p.jabatan}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Penyelenggara */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit Penyelenggara</label>
              <select
                value={unitPenyelenggara}
                onChange={(e) => setUnitPenyelenggara(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
              >
                <option value="">-- Pilih Unit --</option>
                {master?.unit.map((u) => (
                  <option key={u.idUnit} value={u.namaUnit}>{u.namaUnit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Peserta */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Peserta Rapat</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari dan pilih peserta..."
                value={pesertaSearch}
                onChange={(e) => setPesertaSearch(e.target.value)}
                onFocus={() => setShowPesertaDropdown(true)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
              />
              {showPesertaDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredPegawai.map((p) => (
                    <label
                      key={p.idPegawai}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={peserta.includes(p.namaLengkap)}
                        onChange={() => togglePeserta(p.namaLengkap)}
                        className="rounded border-gray-300 text-[#1A6EB5] focus:ring-[#1A6EB5]"
                      />
                      <span>{p.namaLengkap}</span>
                      <span className="text-xs text-gray-400 ml-auto">{p.jabatan}</span>
                    </label>
                  ))}
                  <button
                    onClick={() => setShowPesertaDropdown(false)}
                    className="w-full py-2 text-xs text-[#1A6EB5] hover:bg-blue-50 font-medium border-t"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
            {peserta.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {peserta.map((p) => (
                  <span
                    key={p}
                    className="bg-blue-50 text-[#1A6EB5] px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  >
                    {p}
                    <button onClick={() => togglePeserta(p)} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(2)}
              className="bg-[#1A6EB5] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#145a96] transition-colors"
            >
              Lanjut ke Konten Rapat →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Konten Rapat */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#1C2A3A] mb-5 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#1A6EB5] text-white rounded-lg flex items-center justify-center text-sm">2</span>
            Konten Rapat
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Agenda Rapat <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={agendaRapat}
                onChange={(e) => setAgendaRapat(e.target.value)}
                placeholder="Tuliskan agenda rapat yang akan dibahas..."
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none resize-y ${errors.agendaRapat ? "border-red-400" : "border-gray-200"}`}
              />
              <div className="flex justify-between mt-1">
                {errors.agendaRapat && <p className="text-red-500 text-xs">{errors.agendaRapat}</p>}
                <p className="text-xs text-gray-400 ml-auto">{agendaRapat.length} karakter</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Pembahasan Rapat</label>
              <textarea
                rows={6}
                value={pembahasanRapat}
                onChange={(e) => setPembahasanRapat(e.target.value)}
                placeholder="Tuliskan isi pembahasan rapat..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none resize-y"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{pembahasanRapat.length} karakter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Keputusan Rapat</label>
              <textarea
                rows={4}
                value={keputusanRapat}
                onChange={(e) => setKeputusanRapat(e.target.value)}
                placeholder="Tuliskan keputusan yang diambil..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none resize-y"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{keputusanRapat.length} karakter</p>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              ← Kembali
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-[#1A6EB5] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#145a96] transition-colors"
            >
              Lanjut ke Tindak Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Tindak Lanjut */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-[#1C2A3A] flex items-center gap-2">
              <span className="w-8 h-8 bg-[#1A6EB5] text-white rounded-lg flex items-center justify-center text-sm">3</span>
              Daftar Tindak Lanjut
            </h2>
            <button
              onClick={addTindakLanjut}
              className="inline-flex items-center gap-1.5 bg-[#2ECC71] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#27ae60] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Tindak Lanjut
            </button>
          </div>

          {tindakLanjutRows.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-4xl mb-2">📌</p>
              <p className="text-gray-500 font-medium">Belum ada tindak lanjut</p>
              <p className="text-sm text-gray-400 mt-1">Klik tombol di atas untuk menambah</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tindakLanjutRows.map((tl, idx) => (
                <div
                  key={tl.id}
                  className={`border-l-4 rounded-lg border border-gray-100 p-4 ${prioritasColor[tl.prioritas] || "border-l-gray-300"}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500">Tindak Lanjut #{idx + 1}</span>
                    <button
                      onClick={() => removeTindakLanjut(tl.id)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                      title="Hapus"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Uraian Tindak Lanjut</label>
                      <textarea
                        rows={2}
                        value={tl.uraian}
                        onChange={(e) => updateTindakLanjut(tl.id, "uraian", e.target.value)}
                        placeholder="Deskripsi tindak lanjut..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">PIC</label>
                      <select
                        value={tl.pic}
                        onChange={(e) => updateTindakLanjut(tl.id, "pic", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
                      >
                        <option value="">-- Pilih PIC --</option>
                        {master?.pegawai.map((p) => (
                          <option key={p.idPegawai} value={p.namaLengkap}>{p.namaLengkap}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Unit Pelaksana</label>
                      <select
                        value={tl.unitPelaksana}
                        onChange={(e) => updateTindakLanjut(tl.id, "unitPelaksana", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
                      >
                        <option value="">-- Pilih Unit --</option>
                        {master?.unit.map((u) => (
                          <option key={u.idUnit} value={u.namaUnit}>{u.namaUnit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Deadline</label>
                      <input
                        type="date"
                        value={tl.deadline}
                        onChange={(e) => updateTindakLanjut(tl.id, "deadline", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Prioritas</label>
                      <select
                        value={tl.prioritas}
                        onChange={(e) => updateTindakLanjut(tl.id, "prioritas", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none"
                      >
                        {PRIORITAS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              ← Kembali
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave("Draft")}
                disabled={saving}
                className="px-6 py-2.5 border border-[#1A6EB5] text-[#1A6EB5] rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Draft"}
              </button>
              <button
                onClick={() => handleSave("Selesai")}
                disabled={saving}
                className="px-6 py-2.5 bg-[#2ECC71] text-white rounded-lg text-sm font-medium hover:bg-[#27ae60] transition-colors disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan & Finalisasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RapatInputContent() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#1A6EB5] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FormContent />
    </Suspense>
  );
}
