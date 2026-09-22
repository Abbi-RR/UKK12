"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as React from "react";
import { ArrowLeft, Building2, LogOut, User } from "lucide-react";
import { getMemberProfile, type BookingActionResult } from "../booking/actions";

type Profile = { username: string; nama: string; instansi: string; alamat: string; telp: string; foto: string };
function record(value: unknown): Record<string, unknown> { return typeof value === "object" && value !== null ? value as Record<string, unknown> : {}; }
function text(source: Record<string, unknown>, ...keys: string[]) { for (const key of keys) if (typeof source[key] === "string" && source[key].trim()) return source[key] as string; return "-"; }
function profileFrom(result: BookingActionResult): Profile { const payload = record(result.payload); const data = record(payload.data); const source = Object.keys(data).length ? data : payload; return { username: text(source, "username", "user_name"), nama: text(source, "nama_member", "name", "nama"), instansi: text(source, "instansi", "company", "nama_instansi"), alamat: text(source, "alamat", "address"), telp: text(source, "telp", "no_telp", "phone"), foto: text(source, "foto_profil", "avatar_url", "avatar") }; }
function message(result: BookingActionResult) { if (typeof result.payload.message === "string") return result.payload.message; if (result.status === 401) return "Sesi Anda berakhir. Silakan login kembali."; if (result.status === 403) return "Anda tidak memiliki akses ke profile ini."; return result.status >= 500 ? "Server sedang bermasalah. Coba lagi nanti." : "Profile tidak dapat dimuat."; }

export default function MemberProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let active = true; void getMemberProfile().then((result) => { if (!active) return; if (result.ok) setProfile(profileFrom(result)); else setError(message(result)); setLoading(false); }); return () => { active = false; }; }, []);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); }
  return <main className="min-h-screen bg-background px-4 py-6 text-slate-900 sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl"><header className="flex items-center justify-between"><Link href="/member/booking" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary"><ArrowLeft className="h-4 w-4" />Dashboard Member</Link><button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary"><LogOut className="h-4 w-4" />Logout</button></header><section className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary"><User className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wide text-primary">Member</p><h1 className="text-2xl font-extrabold">Profile Saya</h1></div></div><p className="mt-3 text-sm text-slate-500">Informasi akun dari profile backend. Profile member bersifat read-only.</p>{error && <p role="alert" className="mt-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}{loading ? <p className="mt-8 text-sm text-slate-500">Memuat profile...</p> : profile && <div className="mt-8 grid gap-4 sm:grid-cols-2"><Info label="Username" value={profile.username} /><Info label="Nama member" value={profile.nama} /><Info label="Instansi" value={profile.instansi} /><Info label="Alamat" value={profile.alamat} /><Info label="Nomor telepon" value={profile.telp} /><Info label="Foto" value={profile.foto} icon={<Building2 className="h-4 w-4" />} /></div>}</section></div></main>;
}
function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) { return <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 flex items-center gap-2 break-words text-sm font-semibold text-slate-800">{icon}{value}</p></div>; }
