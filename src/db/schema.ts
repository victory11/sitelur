import {
  pgTable,
  text,
  timestamp,
  integer,
  date,
  time,
  varchar,
  serial,
  jsonb,
} from "drizzle-orm/pg-core";

// ========================
// MASTER DATA TABLES
// ========================

export const masterPegawai = pgTable("master_pegawai", {
  id: serial("id").primaryKey(),
  idPegawai: varchar("id_pegawai", { length: 20 }).notNull().unique(),
  namaLengkap: varchar("nama_lengkap", { length: 200 }).notNull(),
  nip: varchar("nip", { length: 30 }),
  jabatan: varchar("jabatan", { length: 200 }),
  unitKerja: varchar("unit_kerja", { length: 200 }),
  email: varchar("email", { length: 200 }),
  noHp: varchar("no_hp", { length: 20 }),
  role: varchar("role", { length: 20 }).notNull().default("viewer"),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
});

export const masterTempat = pgTable("master_tempat", {
  id: serial("id").primaryKey(),
  idTempat: varchar("id_tempat", { length: 20 }).notNull().unique(),
  namaTempat: varchar("nama_tempat", { length: 200 }).notNull(),
  kapasitas: integer("kapasitas"),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
});

export const masterUnit = pgTable("master_unit", {
  id: serial("id").primaryKey(),
  idUnit: varchar("id_unit", { length: 20 }).notNull().unique(),
  namaUnit: varchar("nama_unit", { length: 200 }).notNull(),
  kepalaUnit: varchar("kepala_unit", { length: 200 }),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
});

export const masterJenisRapat = pgTable("master_jenis_rapat", {
  id: serial("id").primaryKey(),
  idJenis: varchar("id_jenis", { length: 20 }).notNull().unique(),
  namaJenis: varchar("nama_jenis", { length: 200 }).notNull(),
  kodeSingkat: varchar("kode_singkat", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
});

// ========================
// CORE TABLES
// ========================

export const rapat = pgTable("rapat", {
  id: serial("id").primaryKey(),
  idRapat: varchar("id_rapat", { length: 30 }).notNull().unique(),
  nomorRapat: varchar("nomor_rapat", { length: 50 }),
  tanggal: date("tanggal").notNull(),
  jamMulai: time("jam_mulai").notNull(),
  jamSelesai: time("jam_selesai"),
  tempat: varchar("tempat", { length: 200 }),
  namaRapat: varchar("nama_rapat", { length: 500 }).notNull(),
  jenisRapat: varchar("jenis_rapat", { length: 200 }),
  sifatRapat: varchar("sifat_rapat", { length: 50 }),
  metodeRapat: varchar("metode_rapat", { length: 50 }),
  kategoriAgenda: varchar("kategori_agenda", { length: 100 }),
  pimpinanRapat: varchar("pimpinan_rapat", { length: 200 }),
  notulis: varchar("notulis", { length: 200 }),
  unitPenyelenggara: varchar("unit_penyelenggara", { length: 200 }),
  peserta: jsonb("peserta").$type<string[]>().default([]),
  agendaRapat: text("agenda_rapat"),
  pembahasanRapat: text("pembahasan_rapat"),
  keputusanRapat: text("keputusan_rapat"),
  statusRapat: varchar("status_rapat", { length: 30 }).notNull().default("Draft"),
  lampiran: jsonb("lampiran").$type<{ nama: string; url: string; tipe: string }[]>().default([]),
  createdBy: varchar("created_by", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tindakLanjut = pgTable("tindak_lanjut", {
  id: serial("id").primaryKey(),
  idTl: varchar("id_tl", { length: 30 }).notNull().unique(),
  idRapat: varchar("id_rapat", { length: 30 }).notNull(),
  nomorRapat: varchar("nomor_rapat", { length: 50 }),
  uraianTindakLanjut: text("uraian_tindak_lanjut").notNull(),
  pic: varchar("pic", { length: 200 }),
  unitPelaksana: varchar("unit_pelaksana", { length: 200 }),
  deadline: date("deadline"),
  prioritas: varchar("prioritas", { length: 30 }).default("Sedang"),
  status: varchar("status", { length: 30 }).notNull().default("Belum Dilaksanakan"),
  catatanUpdate: text("catatan_update"),
  updatedBy: varchar("updated_by", { length: 200 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  idUser: varchar("id_user", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  nama: varchar("nama", { length: 200 }).notNull(),
  password: varchar("password", { length: 255 }),   // ← TAMBAHKAN BARIS INI
  role: varchar("role", { length: 20 }).notNull().default("viewer"),
  idPegawai: varchar("id_pegawai", { length: 20 }),
  lastLogin: timestamp("last_login"),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
});

export const nomorUrut = pgTable("nomor_urut", {
  id: serial("id").primaryKey(),
  bulanTahun: varchar("bulan_tahun", { length: 20 }).notNull().unique(),
  counter: integer("counter").notNull().default(0),
});

export const logAktivitas = pgTable("log_aktivitas", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  userEmail: varchar("user_email", { length: 200 }),
  aksi: varchar("aksi", { length: 30 }),
  idTarget: varchar("id_target", { length: 30 }),
  detail: text("detail"),
});

export const notifikasi = pgTable("notifikasi", {
  id: serial("id").primaryKey(),
  idNotif: varchar("id_notif", { length: 30 }).notNull().unique(),
  idRapat: varchar("id_rapat", { length: 30 }),
  idTl: varchar("id_tl", { length: 30 }),
  penerimaEmail: varchar("penerima_email", { length: 200 }),
  penerimaNama: varchar("penerima_nama", { length: 200 }),
  pesan: text("pesan"),
  statusKirim: varchar("status_kirim", { length: 20 }).default("Pending"),
  waktuKirim: timestamp("waktu_kirim").defaultNow(),
});
