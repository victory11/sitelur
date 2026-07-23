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
  // ============ API ROUTES ============
  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Viewer: only GET on /api/dashboard — block everything else
    if (session.role === "viewer") {
      if (pathname === "/api/dashboard" && req.method === "GET") {
        return NextResponse.next();
      }
      if (pathname === "/api/auth/me" && req.method === "GET") {
        return NextResponse.next();
      }
      if (pathname === "/api/auth/logout" && req.method === "POST") {
        return NextResponse.next();
      }
      // Allow viewer to change own password
      if (pathname === "/api/users/change-password" && req.method === "POST") {
        return NextResponse.next();
      }
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk fitur ini." },
        { status: 403 }
      );
    }
    // Notulis: can access rapat, tindak-lanjut, master (GET only), dashboard
    if (session.role === "notulis") {
      // Block user management API
      if (pathname.startsWith("/api/users") && pathname !== "/api/users/change-password") {
        return NextResponse.json(
          { error: "Akses ditolak. Hanya admin yang dapat mengelola user." },
          { status: 403 }
        );
      }
      // Block master data write operations
      if (pathname.startsWith("/api/master/") && req.method !== "GET") {
        return NextResponse.json(
          { error: "Akses ditolak. Hanya admin yang dapat mengubah master data." },
          { status: 403 }
        );
      }
      // Block delete rapat
      if (pathname.startsWith("/api/rapat/") && req.method === "DELETE") {
        return NextResponse.json(
          { error: "Akses ditolak. Hanya admin yang dapat menghapus rapat." },
          { status: 403 }
        );
      }
      return NextResponse.next();
    }
    // Admin: full access
    return NextResponse.next();
  }
  // ============ PAGE ROUTES ============
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  // Viewer: only dashboard
  if (session.role === "viewer") {
    if (pathname !== "/") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  // Notulis: dashboard, rapat, tindak-lanjut — NO master, NO users
  if (session.role === "notulis") {
    if (pathname.startsWith("/master") || pathname.startsWith("/users")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  // Users management: admin only
  if (pathname.startsWith("/users") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
