"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

function isSuccessfulResponse(payload: unknown): boolean {
  return typeof payload === "object" && payload !== null && "status" in payload && payload.status === true;
}

function getResponseMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

function getHttpErrorMessage(status: number): string {
  if (status === 400) return "Data login tidak valid.";
  if (status === 401) return "Username atau kata sandi salah.";
  if (status === 403) return "Akses login ditolak oleh server.";
  if (status === 404) return "Endpoint login tidak ditemukan.";
  if (status >= 500) return `Server login mengembalikan error HTTP ${status}.`;
  return `Login gagal dengan HTTP ${status}.`;
}

type UserRole = "member" | "admin_space";

function getResponseRole(payload: unknown): UserRole | undefined {
  if (typeof payload !== "object" || payload === null || !("data" in payload)) {
    return undefined;
  }

  const data = payload.data;
  if (typeof data !== "object" || data === null || !("role" in data)) {
    return undefined;
  }

  return data.role === "member" || data.role === "admin_space" ? data.role : undefined;
}

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "1") {
      window.history.replaceState({}, "", "/login");
      const feedbackTimer = window.setTimeout(() => {
        setSuccess("Registrasi berhasil. Silakan masuk dengan akun Member Anda.");
      }, 0);

      return () => window.clearTimeout(feedbackTimer);
    }
  }, []);

  const emailError = Boolean(error && !emailOrUsername.trim());
  const passwordError = Boolean(error && !password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hasMissingField = !emailOrUsername.trim() || !password;
    if (hasMissingField) {
      setError("Email / Username dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: emailOrUsername.trim(), password }),
      });
      const responseText = await response.text();
      let payload: unknown = {};
      try {
        payload = responseText ? JSON.parse(responseText) : {};
      } catch {
        payload = {};
      }
      const message = getResponseMessage(payload, response.ok ? "Login gagal. Silakan coba lagi." : getHttpErrorMessage(response.status));
      const role = getResponseRole(payload);

      if (!response.ok || !isSuccessfulResponse(payload)) {
        setError(message);
        return;
      }

      if (!role) {
        setError("Role akun tidak dikenali. Silakan hubungi administrator.");
        return;
      }

      setSuccess("Login berhasil. Mengarahkan ke dashboard Anda...");
      router.replace(role === "member" ? "/member/booking" : "/admin");
    } catch {
      setError("Layanan login tidak dapat dijangkau. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[100svh] flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <section className="rounded-2xl border border-slate-200/70 bg-surface p-6 shadow-sm sm:p-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Kembali ke halaman utama RuangKerja"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold tracking-tight text-white">
              RK
            </span>
            <span className="flex flex-col text-left">
              <span className="text-base font-bold leading-tight text-slate-900">
                RuangKerja
              </span>
              <span className="mt-0.5 text-xs font-medium text-slate-500">
                Coworking Space
              </span>
            </span>
          </Link>

          <header className="mb-7">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Masuk ke RuangKerja
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Gunakan akun RuangKerja Anda untuk memesan space dan mengakses tiket reservasi.
            </p>
          </header>

          {success && (
            <p role="status" className="mb-5 rounded-lg bg-primary-light px-3 py-2.5 text-sm text-primary-hover">
              {success}
            </p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="emailOrUsername"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email / Username
              </label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  value={emailOrUsername}
                  onChange={(event) => {
                    setEmailOrUsername(event.target.value);
                    setError("");
                  }}
                  placeholder="nama@email.com atau username"
                  autoComplete="username"
                  aria-invalid={emailError}
                  aria-describedby={emailError ? "emailOrUsername-error" : undefined}
                  className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 ${
                    emailError
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-200 focus:border-primary"
                  }`}
                />
              </div>
              {emailError && (
                <p id="emailOrUsername-error" className="mt-1.5 text-xs text-red-600">
                  Email / Username wajib diisi.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  aria-invalid={passwordError}
                  aria-describedby={passwordError ? "password-error" : undefined}
                  className={`h-11 w-full rounded-lg border bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 ${
                    passwordError
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-200 focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Eye aria-hidden="true" className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="mt-1.5 text-xs text-red-600">
                  Kata sandi wajib diisi.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary accent-primary focus:ring-2 focus:ring-primary/30"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
              <a
                href="#forgot-password"
                onClick={(event) => event.preventDefault()}
                className="shrink-0 font-semibold text-primary transition hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Lupa kata sandi?
              </a>
            </div>

            {error && !emailError && !passwordError && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Memproses...
                </span>
              ) : (
                "Masuk ke Akun"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Belum memiliki akun member?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary transition hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Daftar Akun Baru
            </Link>
          </p>
        </section>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 text-primary" />
          Dilindungi dengan koneksi aman TLS 1.3
        </p>
      </div>
    </main>
  );
}
