export function generateId(prefix: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `${prefix}-${y}${m}${d}-${rand}`;
}

export const BULAN_ROMAWI = [
  "I", "II", "III", "IV", "V", "VI",
  "VII", "VIII", "IX", "X", "XI", "XII",
];

export const STATUS_RAPAT = ["Draft", "Berlangsung", "Selesai", "Ditutup"] as const;
export const STATUS_TL = ["Belum Dilaksanakan", "Proses", "Selesai", "Tertunda"] as const;
export const PRIORITAS = ["Sangat Tinggi", "Tinggi", "Sedang", "Rendah"] as const;
export const SIFAT_RAPAT = ["Rutin", "Insidental", "Mendesak"] as const;
export const METODE_RAPAT = ["Luring", "Daring", "Hybrid"] as const;
export const KATEGORI_AGENDA = [
  "Pelayanan", "SDM", "Keuangan", "Sarana Prasarana",
  "Mutu", "Pendidikan", "BPJS", "Akreditasi", "Lainnya",
] as const;

export function formatDateID(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function prioritasColor(p: string) {
  switch (p) {
    case "Sangat Tinggi": return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" };
    case "Tinggi": return { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" };
    case "Sedang": return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" };
    case "Rendah": return { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" };
    default: return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" };
  }
}

export function statusRapatColor(s: string) {
  switch (s) {
    case "Draft": return { bg: "bg-gray-100", text: "text-gray-700" };
    case "Berlangsung": return { bg: "bg-blue-100", text: "text-blue-700" };
    case "Selesai": return { bg: "bg-green-100", text: "text-green-700" };
    case "Ditutup": return { bg: "bg-slate-200", text: "text-slate-800" };
    default: return { bg: "bg-gray-100", text: "text-gray-700" };
  }
}

export function statusTLColor(s: string) {
  switch (s) {
    case "Belum Dilaksanakan": return { bg: "bg-gray-100", text: "text-gray-700" };
    case "Proses": return { bg: "bg-blue-100", text: "text-blue-700" };
    case "Selesai": return { bg: "bg-green-100", text: "text-green-700" };
    case "Tertunda": return { bg: "bg-red-100", text: "text-red-700" };
    default: return { bg: "bg-gray-100", text: "text-gray-700" };
  }
}
