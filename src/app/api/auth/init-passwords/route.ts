import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, masterPegawai } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const allPegawai = await db.select().from(masterPegawai);
    const existingUsers = await db.select().from(users);
    const existingEmails = new Set(existingUsers.map((u) => u.email));
    const existingPegawaiIds = new Set(
      existingUsers.map((u) => u.idPegawai).filter(Boolean)
    );

    const defaultPassword = await bcrypt.hash("sitelur123", 10);
    let created = 0;
    let updated = 0;

    const adminUser = existingUsers.find((u) => u.email === "admin@rsud.go.id");
    if (adminUser && !adminUser.password) {
      await db
        .update(users)
        .set({ password: defaultPassword })
        .where(eq(users.email, "admin@rsud.go.id"));
      updated++;
    }

    for (let i = 0; i < allPegawai.length; i++) {
      const p = allPegawai[i];
      if (existingPegawaiIds.has(p.idPegawai)) continue;

      const slug = p.namaLengkap
        .toLowerCase()
        .replace(/dr\.|drs\.|ns\.|apt\.|ir\.|hj\.|sp\.|m\.|s\./g, "")
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "")
        .split(".")
        .filter(Boolean)
        .slice(0, 2)
        .join(".");
      let uniqueEmail = `${slug || p.idPegawai.toLowerCase()}@rsud.go.id`;

      let attempt = 1;
      while (existingEmails.has(uniqueEmail)) {
        uniqueEmail = `${slug}${attempt}@rsud.go.id`;
        attempt++;
      }

      try {
        await db.insert(users).values({
          idUser: `USR-${String(existingUsers.length + created + 2).padStart(3, "0")}`,
          email: uniqueEmail,
          nama: p.namaLengkap,
          password: defaultPassword,
          role: (p.role as "admin" | "notulis" | "viewer") || "viewer",
          idPegawai: p.idPegawai,
          status: "Aktif",
        });
        existingEmails.add(uniqueEmail);
        existingPegawaiIds.add(p.idPegawai);
        created++;
      } catch (e) {
        console.warn(`Skip user ${uniqueEmail}`);
      }
    }

    await db
      .update(users)
      .set({ password: defaultPassword })
      .where(isNull(users.password));

    return NextResponse.json({
      success: true,
      created,
      updated,
      message: `Default password untuk semua akun: sitelur123`,
    });
  } catch (error) {
    console.error("Init passwords error:", error);
    return NextResponse.json(
      { error: "Failed to init passwords", detail: String(error) },
      { status: 500 }
    );
  }
}