import { db } from "./index";
import {
  masterTempat,
  masterUnit,
  masterJenisRapat,
  masterPegawai,
  users,
} from "./schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Check if already seeded
  const existingTempat = await db.select().from(masterTempat).limit(1);
  if (existingTempat.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  // Seed Master Tempat
  const tempatData = [
    "Ruang Rapat Direksi", "Aula RSUD", "Ruang Komite Medik",
    "Ruang Wadir Pelayanan", "Ruang Wadir Umum", "Ruang Pertemuan Lantai 2",
    "Ruang Diklat", "Ruang Zoom Meeting", "Lainnya",
  ];
  for (let i = 0; i < tempatData.length; i++) {
    await db.insert(masterTempat).values({
      idTempat: `TMP-${String(i + 1).padStart(3, "0")}`,
      namaTempat: tempatData[i],
      kapasitas: tempatData[i] === "Lainnya" ? null : 20 + i * 5,
      status: "Aktif",
    });
  }

  // Seed Master Unit
  const unitData = [
    "Direksi", "Tata Usaha", "Bidang Pelayanan", "Bidang Penunjang",
    "Bagian Perencanaan", "Bagian Keuangan", "SDM", "Instalasi Rawat Jalan",
    "Instalasi Rawat Inap", "IGD", "ICU", "IBS", "Farmasi", "Laboratorium",
    "Radiologi", "Rekam Medis", "Gizi", "CSSD", "Laundry", "IPSRS",
    "Humas", "SPI", "Komite Medik", "Komite Keperawatan", "Tim Mutu",
  ];
  for (let i = 0; i < unitData.length; i++) {
    await db.insert(masterUnit).values({
      idUnit: `UNIT-${String(i + 1).padStart(3, "0")}`,
      namaUnit: unitData[i],
      status: "Aktif",
    });
  }

  // Seed Master Jenis Rapat
  const jenisData: [string, string][] = [
    ["Coffee Morning", "CM"], ["Rapat Direksi", "RD"], ["Rapat Manajemen", "RM"],
    ["Rapat Evaluasi", "RE"], ["Rapat Koordinasi", "RK"], ["Rapat Monitoring", "RMT"],
    ["Rapat Komite Medik", "RKM"], ["Rapat Komite Keperawatan", "RKK"],
    ["Rapat Tim Mutu", "RTM"], ["Rapat Akreditasi", "RA"], ["Rapat PPI", "RPPI"],
    ["Rapat SPI", "RSPI"], ["Rapat BLUD", "RBL"], ["Rapat Penyusunan Anggaran", "RPA"],
    ["Rapat Pendidikan", "RPD"], ["Rapat Lainnya", "RL"],
  ];
  for (let i = 0; i < jenisData.length; i++) {
    await db.insert(masterJenisRapat).values({
      idJenis: `JR-${String(i + 1).padStart(3, "0")}`,
      namaJenis: jenisData[i][0],
      kodeSingkat: jenisData[i][1],
      status: "Aktif",
    });
  }

  // Seed Master Pegawai
  const pegawaiData: { nama: string; jabatan: string; unit: string; role: string }[] = [
    { nama: "dr. Hasan Basri, Sp.PD", jabatan: "Direktur", unit: "Direksi", role: "admin" },
    { nama: "dr. Siti Aminah, M.Kes", jabatan: "Wakil Direktur Pelayanan", unit: "Direksi", role: "admin" },
    { nama: "Drs. Budi Santoso, M.Si", jabatan: "Wakil Direktur Umum & Keuangan", unit: "Direksi", role: "admin" },
    { nama: "Ahmad Zainuri, S.Kep", jabatan: "Kabag Tata Usaha", unit: "Tata Usaha", role: "notulis" },
    { nama: "dr. Rina Wati, M.Kes", jabatan: "Kabid Pelayanan", unit: "Bidang Pelayanan", role: "notulis" },
    { nama: "Dewi Sartika, SKM", jabatan: "Kabid Penunjang", unit: "Bidang Penunjang", role: "notulis" },
    { nama: "Ir. Agus Prasetyo", jabatan: "Kabag Perencanaan", unit: "Bagian Perencanaan", role: "notulis" },
    { nama: "Hj. Nur Aini, SE, M.Ak", jabatan: "Kabag Keuangan", unit: "Bagian Keuangan", role: "notulis" },
    { nama: "Eko Prasetyo, S.Sos", jabatan: "Kasubag SDM", unit: "SDM", role: "notulis" },
    { nama: "dr. Fitri Handayani", jabatan: "Ka. Instalasi Rawat Jalan", unit: "Instalasi Rawat Jalan", role: "viewer" },
    { nama: "Ns. Ratna Sari, S.Kep", jabatan: "Ka. Instalasi Rawat Inap", unit: "Instalasi Rawat Inap", role: "viewer" },
    { nama: "dr. Muhammad Ali, Sp.EM", jabatan: "Ka. IGD", unit: "IGD", role: "viewer" },
    { nama: "Apt. Lestari Dewi, S.Farm", jabatan: "Ka. Farmasi", unit: "Farmasi", role: "viewer" },
    { nama: "dr. Wahyu Hidayat, Sp.PK", jabatan: "Ka. Laboratorium", unit: "Laboratorium", role: "viewer" },
    { nama: "dr. Nurul Huda, Sp.Rad", jabatan: "Ka. Radiologi", unit: "Radiologi", role: "viewer" },
    { nama: "Siti Maryam, A.Md.RMIK", jabatan: "Ka. Rekam Medis", unit: "Rekam Medis", role: "viewer" },
    { nama: "Hendra Gunawan, S.Gz", jabatan: "Ka. Gizi", unit: "Gizi", role: "viewer" },
    { nama: "Bambang Wijaya, S.Kom", jabatan: "Ka. Humas & IT", unit: "Humas", role: "admin" },
    { nama: "dr. Kartini Susanti, Sp.A", jabatan: "Ketua Komite Medik", unit: "Komite Medik", role: "viewer" },
    { nama: "Ns. Endang Purwanti, S.Kep", jabatan: "Ketua Komite Keperawatan", unit: "Komite Keperawatan", role: "viewer" },
  ];
  for (let i = 0; i < pegawaiData.length; i++) {
    const p = pegawaiData[i];
    await db.insert(masterPegawai).values({
      idPegawai: `PEG-${String(i + 1).padStart(3, "0")}`,
      namaLengkap: p.nama,
      nip: `19${70 + i}0${(i % 9) + 1}15 ${199 + i}0${(i % 9) + 1} ${i + 1} ${String(i * 3 + 100).padStart(3, "0")}`,
      jabatan: p.jabatan,
      unitKerja: p.unit,
      email: `${p.nama.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")}@rsud.go.id`,
      noHp: `0812${String(10000000 + i * 1111).slice(0, 8)}`,
      role: p.role,
      status: "Aktif",
    });
  }

  // Seed default admin user
  await db.insert(users).values({
    idUser: "USR-001",
    email: "admin@rsud.go.id",
    nama: "Administrator",
    role: "admin",
    idPegawai: "PEG-018",
    status: "Aktif",
  });

  console.log("Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  });
