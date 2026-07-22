import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rapat, tindakLanjut, nomorUrut, logAktivitas, masterJenisRapat } from "@/db/schema";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { generateId, BULAN_ROMAWI } from "@/lib/utils";

async function generateNomorRapat(jenisRapatNama: string): Promise<string> {
  // Get kode singkat
  const jenisList = await db.select().from(masterJenisRapat);
  let kode = "RL";
  for (const j of jenisList) {
    if (j.namaJenis === jenisRapatNama) {
      kode = j.kodeSingkat;
      break;
    }
  }

  const now = new Date();
  const bulan = BULAN_ROMAWI[now.getMonth()];
  const tahun = now.getFullYear();
  const keyBulan = `${bulan}/${tahun}`;

  // Increment counter
  const existing = await db.select().from(nomorUrut).where(eq(nomorUrut.bulanTahun, keyBulan));
  let counter: number;
  if (existing.length === 0) {
    counter = 1;
    await db.insert(nomorUrut).values({ bulanTahun: keyBulan, counter: 1 });
  } else {
    counter = existing[0].counter + 1;
    await db.update(nomorUrut).set({ counter }).where(eq(nomorUrut.bulanTahun, keyBulan));
  }

  const nomorUrutStr = String(counter).padStart(3, "0");
  return `${nomorUrutStr}/${kode}/RSUD/${keyBulan}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const jenis = searchParams.get("jenis");
    const unit = searchParams.get("unit");

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(rapat.statusRapat, status));
    }
    if (jenis && jenis !== "all") {
      conditions.push(eq(rapat.jenisRapat, jenis));
    }
    if (unit && unit !== "all") {
      conditions.push(eq(rapat.unitPenyelenggara, unit));
    }
    if (search) {
      conditions.push(
        sql`(${rapat.namaRapat} ILIKE ${`%${search}%`} OR ${rapat.nomorRapat} ILIKE ${`%${search}%`})`
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const data = await db.select().from(rapat).where(where).orderBy(desc(rapat.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/rapat error:", error);
    return NextResponse.json({ error: "Failed to fetch rapat" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idRapat = generateId("RPT");
    const nomorRapatStr = await generateNomorRapat(body.jenisRapat || "Rapat Lainnya");

    const newRapat = await db.insert(rapat).values({
      idRapat,
      nomorRapat: nomorRapatStr,
      tanggal: body.tanggal,
      jamMulai: body.jamMulai,
      jamSelesai: body.jamSelesai || null,
      tempat: body.tempat || null,
      namaRapat: body.namaRapat,
      jenisRapat: body.jenisRapat || null,
      sifatRapat: body.sifatRapat || null,
      metodeRapat: body.metodeRapat || null,
      kategoriAgenda: body.kategoriAgenda || null,
      pimpinanRapat: body.pimpinanRapat || null,
      notulis: body.notulis || null,
      unitPenyelenggara: body.unitPenyelenggara || null,
      peserta: body.peserta || [],
      agendaRapat: body.agendaRapat || null,
      pembahasanRapat: body.pembahasanRapat || null,
      keputusanRapat: body.keputusanRapat || null,
      statusRapat: body.statusRapat || "Draft",
      lampiran: body.lampiran || [],
      createdBy: body.createdBy || "admin@rsud.go.id",
    }).returning();

    // Save tindak lanjut
    if (body.tindakLanjut && body.tindakLanjut.length > 0) {
      for (const tl of body.tindakLanjut) {
        await db.insert(tindakLanjut).values({
          idTl: generateId("TL"),
          idRapat,
          nomorRapat: nomorRapatStr,
          uraianTindakLanjut: tl.uraian,
          pic: tl.pic || null,
          unitPelaksana: tl.unitPelaksana || null,
          deadline: tl.deadline || null,
          prioritas: tl.prioritas || "Sedang",
          status: "Belum Dilaksanakan",
          updatedBy: body.createdBy || "admin@rsud.go.id",
        });
      }
    }

    // Log activity
    await db.insert(logAktivitas).values({
      userEmail: body.createdBy || "admin@rsud.go.id",
      aksi: "CREATE",
      idTarget: idRapat,
      detail: `Rapat baru: ${body.namaRapat}`,
    });

    return NextResponse.json({
      success: true,
      idRapat,
      nomorRapat: nomorRapatStr,
      data: newRapat[0],
    });
  } catch (error) {
    console.error("POST /api/rapat error:", error);
    return NextResponse.json({ error: "Failed to create rapat" }, { status: 500 });
  }
}
