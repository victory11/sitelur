import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, logAktivitas } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (foundUsers.length === 0) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const user = foundUsers[0];

    if (user.status !== "Aktif") {
      return NextResponse.json(
        { error: "Akun Anda tidak aktif. Hubungi admin." },
        { status: 403 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Akun belum diset password. Hubungi admin." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.idUser, user.idUser));

    await db.insert(logAktivitas).values({
      userEmail: user.email,
      aksi: "LOGIN",
      idTarget: user.idUser,
      detail: `Login berhasil: ${user.nama}`,
    });

    const token = await createSession({
      idUser: user.idUser,
      email: user.email,
      nama: user.nama,
      role: user.role as "admin" | "notulis" | "viewer",
      idPegawai: user.idPegawai,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        idUser: user.idUser,
        email: user.email,
        nama: user.nama,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}