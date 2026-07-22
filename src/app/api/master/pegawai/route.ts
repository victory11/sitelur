import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { masterPegawai } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(masterPegawai);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await db.select().from(masterPegawai);
    const idPegawai = `PEG-${String(count.length + 1).padStart(3, "0")}`;
    const result = await db.insert(masterPegawai).values({
      idPegawai,
      namaLengkap: body.namaLengkap,
      nip: body.nip || null,
      jabatan: body.jabatan || null,
      unitKerja: body.unitKerja || null,
      email: body.email || null,
      noHp: body.noHp || null,
      role: body.role || "viewer",
      status: body.status || "Aktif",
    }).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("POST /api/master/pegawai error:", error);
    return NextResponse.json({ error: "Failed to create pegawai" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await db
      .update(masterPegawai)
      .set({
        namaLengkap: body.namaLengkap,
        nip: body.nip,
        jabatan: body.jabatan,
        unitKerja: body.unitKerja,
        email: body.email,
        noHp: body.noHp,
        role: body.role,
        status: body.status,
      })
      .where(eq(masterPegawai.idPegawai, body.idPegawai))
      .returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/master/pegawai error:", error);
    return NextResponse.json({ error: "Failed to update pegawai" }, { status: 500 });
  }
}
