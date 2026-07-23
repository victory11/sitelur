import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select({
        idUser: users.idUser,
        email: users.email,
        nama: users.nama,
        role: users.role,
        idPegawai: users.idPegawai,
        lastLogin: users.lastLogin,
        status: users.status,
      })
      .from(users);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { idUser, role, status } = body;

    if (!idUser) {
      return NextResponse.json({ error: "idUser wajib diisi" }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.idUser, idUser))
      .returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("PUT /api/users error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}