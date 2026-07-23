import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, logAktivitas } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { targetUserId, newPassword, currentPassword } = body;
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal 6 karakter" },
        { status: 400 }
      );
    }
    // Determine target user
    const isAdmin = session.role === "admin";
    const isSelf = !targetUserId || targetUserId === session.idUser;
    // Non-admin can only change their own password
    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: "Anda hanya dapat mengganti password sendiri" },
        { status: 403 }
      );
    }
    const targetId = isSelf ? session.idUser : targetUserId;
    // If changing own password, verify current password
    if (isSelf && currentPassword) {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.idUser, targetId));
      if (userRows.length === 0) {
        return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
      }
      if (userRows[0].password) {
        const isValid = await bcrypt.compare(currentPassword, userRows[0].password);
        if (!isValid) {
          return NextResponse.json(
            { error: "Password lama salah" },
            { status: 401 }
          );
        }
      }
    }
    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.idUser, targetId));
    // Log activity
    await db.insert(logAktivitas).values({
      userEmail: session.email,
      aksi: "UPDATE",
      idTarget: targetId,
      detail: isAdmin && !isSelf
        ? `Admin reset password user ${targetId}`
        : "Ganti password sendiri",
    });
    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Gagal mengubah password" },
      { status: 500 }
    );
  }
}
