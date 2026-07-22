"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initMessage, setInitMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/init-passwords", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.created > 0) setInitMessage(`${d.created} akun user dibuat otomatis dari master pegawai.`);
      }).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login gagal"); setLoading(false); return; }
      window.location.href = nextPath;
    } catch { setError("Terjadi kesalahan koneksi"); setLoading(false); }
  };

  const quickLogin = (accountEmail: string) => { setEmail(accountEmail); setPassword("sitelur123"); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A6EB5] via-[#145a96] to-[#1C2A3A] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-[#1A6EB5] to-[#145a96] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
            <div className="absolute bottom-20 right-10 w-48 h-48 border-4 border-white rounded-full" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">🏥</div>
              <div>
                <h1 className="text-2xl font-bold">SITELUR</h1>
                <p className="text-xs text-white/80">Tata Kelola Rapat RSUD</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3 leading-tight">Selamat Datang di Portal<br />Manajemen Rapat RSUD</h2>
            <p className="text-white/80 text-sm">Kelola rapat, notulensi, dan tindak lanjut secara digital.</p>
          </div>
          <div className="relative space-y-3 mt-8">
            <div className="flex items-center gap-3 text-sm"><div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">📋</div><span>Dokumentasi rapat lengkap</span></div>
            <div className="flex items-center gap-3 text-sm"><div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">📌</div><span>Monitoring tindak lanjut</span></div>
            <div className="flex items-center gap-3 text-sm"><div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🖨️</div><span>Cetak notulen otomatis</span></div>
            <div className="flex items-center gap-3 text-sm"><div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">📊</div><span>Dashboard analitik real-time</span></div>
          </div>
          <div className="relative text-xs text-white/60 mt-8">© 2026 RSUD — SITELUR v1.0</div>
        </div>

        <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#1A6EB5] rounded-xl flex items-center justify-center text-2xl">🏥</div>
            <div><h1 className="text-xl font-bold text-[#1C2A3A]">SITELUR</h1><p className="text-xs text-gray-500">Tata Kelola Rapat RSUD</p></div>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1C2A3A]">Masuk ke Akun Anda</h2>
            <p className="text-sm text-gray-500 mt-1">Silakan masukkan email dan password</p>
          </div>
          {initMessage && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-start gap-2"><span>ℹ️</span><span>{initMessage}</span></div>}
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2"><span>⚠️</span><span>{error}</span></div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@rsud.go.id" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" className="w-full pr-20 pl-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A6EB5]/20 focus:border-[#1A6EB5] outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium">{showPassword ? "Sembunyikan" : "Tampilkan"}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#1A6EB5] hover:bg-[#145a96] disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md flex items-center justify-center gap-2">
              {loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Memproses...</>) : "Masuk"}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3 text-center font-medium">🎯 Akun Demo (klik untuk auto-isi)</p>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => quickLogin("admin@rsud.go.id")} className="text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">A</span>
                  <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-purple-900">Admin</p><p className="text-[10px] text-purple-600 truncate">admin@rsud.go.id</p></div>
                  <span className="text-[10px] text-purple-500 font-medium">Full Access</span>
                </div>
              </button>
              <button onClick={() => quickLogin("ahmad.zainuri@rsud.go.id")} className="text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">N</span>
                  <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-blue-900">Notulis</p><p className="text-[10px] text-blue-600 truncate">ahmad.zainuri@rsud.go.id</p></div>
                  <span className="text-[10px] text-blue-500 font-medium">Input & Edit</span>
                </div>
              </button>
              <button onClick={() => quickLogin("fitri.handayani@rsud.go.id")} className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">V</span>
                  <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900">Viewer</p><p className="text-[10px] text-gray-600 truncate">fitri.handayani@rsud.go.id</p></div>
                  <span className="text-[10px] text-gray-500 font-medium">View Only</span>
                </div>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center">Password default semua akun: <span className="font-mono font-semibold">sitelur123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}