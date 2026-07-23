import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { masterPegawai, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
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
    // Sync: create user account if email provided
    if (body.email) {
      const existingUser = await db.select().from(users).where(eq(users.email, body.email));
      if (existingUser.length === 0) {
        const allUsers = await db.select().from(users);
        const defaultPassword = await bcrypt.hash("sitelur123", 10);
        await db.insert(users).values({
          idUser: `USR-${String(allUsers.length + 1).padStart(3, "0")}`,
          email: body.email,
          nama: body.namaLengkap,
          password: defaultPassword,
          role: body.role || "viewer",
          idPegawai,
          status: body.status || "Aktif",
        });
      }
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("POST /api/master/pegawai error:", error);
    return NextResponse.json({ error: "Failed to create pegawai" }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    // Get old pegawai data to find old email
    const oldPegawai = await db
      .select()
      .from(masterPegawai)
      .where(eq(masterPegawai.idPegawai, body.idPegawai));
    const oldEmail = oldPegawai.length > 0 ? oldPegawai[0].email : null;
    // Update master pegawai
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
    // Sync: update linked user account
    const linkedUser = await db
      .select()
      .from(users)
      .where(eq(users.idPegawai, body.idPegawai));
    if (linkedUser.length > 0) {
      // Update existing user
      const updateFields: Record<string, string> = {
        nama: body.namaLengkap,
        role: body.role,
        status: body.status,
      };
      if (body.email) {
        updateFields.email = body.email;
      }
      await db
        .update(users)
        .set(updateFields)
        .where(eq(users.idPegawai, body.idPegawai));
    } else if (body.email) {
      // No linked user yet — create one
      const allUsers = await db.select().from(users);
      const defaultPassword = await bcrypt.hash("sitelur123", 10);
      await db.insert(users).values({
        idUser: `USR-${String(allUsers.length + 1).padStart(3, "0")}`,
        email: body.email,
        nama: body.namaLengkap,
        password: defaultPassword,
        role: body.role || "viewer",
        idPegawai: body.idPegawai,
        status: body.status || "Aktif",
      });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/master/pegawai error:", error);
    return NextResponse.json({ error: "Failed to update pegawai" }, { status: 500 });
  }
}
