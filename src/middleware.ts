import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sitelur-super-secret-key-change-in-production-2026"
);

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/init-passwords",
  "/api/health",
  "/api/seed",
];

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { role: string; email: string; nama: string; idUser: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("sitelur_session")?.value;
  const session = token ? await verifyToken(token) : null;

  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "viewer" && req.method !== "GET") {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses. Role viewer hanya dapat melihat data." },
        { status: 403 }
      );
    }

    const isAdminOnlyRoute =
      pathname.startsWith("/api/master/") && req.method !== "GET";
    const isDeleteRapat =
      pathname.startsWith("/api/rapat/") && req.method === "DELETE";

    if ((isAdminOnlyRoute || isDeleteRapat) && session.role !== "admin") {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya admin yang dapat melakukan operasi ini." },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role === "viewer") {
    if (pathname.startsWith("/rapat/input") || pathname.startsWith("/master")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/master") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};