"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Building,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
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

type TextFieldProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  optional?: boolean;
  error?: string;
  autoComplete?: string;
};

function TextField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  optional = false,
  error,
  autoComplete,
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {optional && <span className="ml-1.5 font-normal text-slate-400">(opsional)</span>}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          id={id}
          name={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 ${
            error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-primary"
          }`}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  error?: string;
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisibility,
  error,
}: PasswordFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Lock
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Masukkan kata sandi"
          autoComplete={id === "password" ? "new-password" : "new-password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full rounded-lg border bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 ${
            error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-primary"
          }`}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={visible ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {visible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const errors = {
    fullName: hasSubmitted && !fullName.trim() ? "Nama lengkap wajib diisi." : "",
    phone: hasSubmitted && !phone.trim() ? "Nomor WhatsApp / HP wajib diisi." : "",
    username: hasSubmitted && !username.trim() ? "Username wajib diisi." : "",
    email: "",
    city: hasSubmitted && !city ? "Domisili wajib dipilih." : "",
    company: hasSubmitted && !company.trim() ? "Instansi / Perusahaan wajib diisi." : "",
    password: hasSubmitted && !password ? "Kata sandi wajib diisi." : "",
    passwordLength: hasSubmitted && password.length > 0 && password.length < 6 ? "Kata sandi minimal 6 karakter." : "",
    confirmPassword: hasSubmitted && !confirmPassword
      ? "Konfirmasi kata sandi wajib diisi."
      : hasSubmitted && password !== confirmPassword
        ? "Konfirmasi kata sandi tidak sama."
        : "",
    terms: hasSubmitted && !agreeToTerms ? "Persetujuan wajib dicentang." : "",
  };

  function clearError() {
    setError("");
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setProfilePhoto(event.target.files?.[0] ?? null);
    clearError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    const isInvalid =
      !fullName.trim() ||
      !phone.trim() ||
      !username.trim() ||
      !city ||
      !company.trim() ||
      !password ||
      password.length < 6 ||
      !confirmPassword ||
      password !== confirmPassword ||
      !agreeToTerms;

    if (isInvalid) {
      setError("Periksa kembali data wajib yang belum lengkap.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const registrationBody: Record<string, string> = {
        username: username.trim(),
        password,
        nama_member: fullName.trim(),
        instansi: company.trim(),
        alamat: city,
        telp: phone.trim(),
      };

      const response = await fetch("/api/auth/register/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationBody),
      });
      const payload: unknown = await response.json();
      const message = getResponseMessage(payload, "Registrasi member gagal. Silakan coba lagi.");

      if (!response.ok || !isSuccessfulResponse(payload)) {
        setError(message);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Layanan registrasi tidak dapat dijangkau. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[100svh] flex-1 flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-xl">
        <section className="rounded-2xl border border-slate-200/70 bg-surface p-6 shadow-sm sm:p-8">
          <Link
            href="/"
            aria-label="Kembali ke halaman utama RuangKerja"
            className="mb-8 inline-flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold tracking-tight text-white">
              RK
            </span>
            <span className="flex flex-col text-left">
              <span className="text-base font-bold leading-tight text-slate-900">RuangKerja</span>
              <span className="mt-0.5 text-xs font-medium text-slate-500">Coworking Space</span>
            </span>
          </Link>

          <header className="mb-7">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Daftar Akun Member RuangKerja</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Nikmati akses fleksibel ke workstation, private office, dan meeting room tanpa deposit awal.
            </p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Foto Profil <span className="font-normal text-slate-400">(opsional)</span></span>
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-primary-light/40 px-4 py-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor="profilePhoto" className="inline-flex cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-primary hover:text-primary focus-within:ring-2 focus-within:ring-primary/30">
                    Pilih Foto
                  </label>
                  <input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
                  <p className="mt-1 truncate text-xs text-slate-500">{profilePhoto?.name ?? "JPG, PNG, atau WEBP"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextField id="fullName" label="Nama Lengkap" icon={User} value={fullName} onChange={(value) => { setFullName(value); clearError(); }} error={errors.fullName} autoComplete="name" />
              <TextField id="phone" label="WhatsApp / No. HP" icon={Phone} value={phone} onChange={(value) => { setPhone(value); clearError(); }} placeholder="+62 812 3456 7890" error={errors.phone} autoComplete="tel" />
              <TextField id="username" label="Username" icon={User} value={username} onChange={(value) => { setUsername(value); clearError(); }} error={errors.username} autoComplete="username" />
              <TextField id="email" label="Email" icon={Mail} value={email} onChange={(value) => { setEmail(value); clearError(); }} placeholder="nama@email.com" optional autoComplete="email" />

              <div>
                <label htmlFor="city" className="mb-2 block text-sm font-semibold text-slate-700">Domisili</label>
                <div className="relative">
                  <MapPin aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select id="city" name="city" value={city} onChange={(event) => { setCity(event.target.value); clearError(); }} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? "city-error" : undefined} className={`h-11 w-full appearance-none rounded-lg border bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/20 ${errors.city ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-primary"}`}>
                    <option value="">Pilih domisili</option>
                    <option>SCBD Jakarta</option>
                    <option>Sudirman Bandung</option>
                    <option>Gubeng Surabaya</option>
                    <option>Malioboro Jogja</option>
                  </select>
                </div>
                {errors.city && <p id="city-error" className="mt-1.5 text-xs text-red-600">{errors.city}</p>}
              </div>
              <TextField id="company" label="Instansi / Perusahaan" icon={Building} value={company} onChange={(value) => { setCompany(value); clearError(); }} placeholder="Nama instansi atau perusahaan" error={errors.company} autoComplete="organization" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <PasswordField id="password" label="Kata Sandi" value={password} onChange={(value) => { setPassword(value); clearError(); }} visible={showPassword} onToggleVisibility={() => setShowPassword((visible) => !visible)} error={errors.password || errors.passwordLength} />
              <PasswordField id="confirmPassword" label="Konfirmasi Kata Sandi" value={confirmPassword} onChange={(value) => { setConfirmPassword(value); clearError(); }} visible={showConfirmPassword} onToggleVisibility={() => setShowConfirmPassword((visible) => !visible)} error={errors.confirmPassword} />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-slate-600">
                <input type="checkbox" name="agreeToTerms" checked={agreeToTerms} onChange={(event) => { setAgreeToTerms(event.target.checked); clearError(); }} aria-invalid={Boolean(errors.terms)} aria-describedby={errors.terms ? "terms-error" : undefined} className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-primary focus:ring-2 focus:ring-primary/30" />
                <span>Saya menyetujui <a href="#terms" onClick={(event) => event.preventDefault()} className="font-semibold text-primary hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">Syarat &amp; Ketentuan</a> dan <a href="#privacy" onClick={(event) => event.preventDefault()} className="font-semibold text-primary hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">Kebijakan Privasi</a> RuangKerja.</span>
              </label>
              {errors.terms && <p id="terms-error" className="mt-1.5 text-xs text-red-600">{errors.terms}</p>}
            </div>

            {error && !Object.values(errors).some(Boolean) && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}

            <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? <span className="flex items-center gap-2"><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Mendaftarkan...</span> : "Daftar Akun Member Sekarang"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-semibold text-primary transition hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Masuk ke Akun Member</Link>
          </p>
        </section>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
          Data akun Anda dikirim melalui koneksi yang aman.
        </p>
      </div>
    </main>
  );
}
