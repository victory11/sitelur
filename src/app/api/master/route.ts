import { NextResponse } from "next/server";
import { db } from "@/db";
import { masterPegawai, masterTempat, masterUnit, masterJenisRapat } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const [pegawai, tempat, unit, jenisRapat] = await Promise.all([
      db.select().from(masterPegawai).where(eq(masterPegawai.status, "Aktif")),
      db.select().from(masterTempat).where(eq(masterTempat.status, "Aktif")),
      db.select().from(masterUnit).where(eq(masterUnit.status, "Aktif")),
      db.select().from(masterJenisRapat).where(eq(masterJenisRapat.status, "Aktif")),
    ]);
    return NextResponse.json({ pegawai, tempat, unit, jenisRapat });
  } catch (error) {
    console.error("GET /api/master error:", error);
    return NextResponse.json({ error: "Failed to fetch master data" }, { status: 500 });
  }
}
