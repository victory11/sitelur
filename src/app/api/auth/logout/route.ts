import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth";
import { db } from "@/db";
import { logAktivitas } from "@/db/schema";

export async function POST() {
  try {
    const session = await getSession();
    if (session) {
      await db.insert(logAktivitas).values({
        userEmail: session.email,
        aksi: "LOGOUT",
        idTarget: session.idUser,
        detail: `Logout: ${session.nama}`,
      });
    }
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}