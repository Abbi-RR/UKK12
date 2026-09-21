"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthenticatedUser } from "@/lib/auth-session";
import { ArrowRight, Building2, LoaderCircle, LogOut, Menu, User, X } from "lucide-react";

type NavbarProps = {
  user: AuthenticatedUser | null;
};

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "#beranda" },
    { name: "Cara Reservasi", href: "#alur" },
    { name: "Katalog Ruang", href: "#ruang" },
    { name: "Keunggulan", href: "#keunggulan" },
    { name: "FAQ", href: "#faq" },
  ];

  const dashboardHref = user?.role === "admin_space" ? "/admin" : undefined;
  const profileLabel = user?.displayName ?? (user?.role === "admin_space" ? "Admin Space" : "Member");

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Logout gagal.");
      }

      router.replace("/");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/70 py-3"
          : "bg-white/70 backdrop-blur-sm border-b border-slate-200/50 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Nama RuangKerja */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                Ruang<span className="text-teal-600">Kerja</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-1">
                Coworking Space
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-white rounded-full transition-all duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-teal-700 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm shadow-teal-600/20 hover:shadow-md hover:shadow-teal-600/30 transition-all duration-200 flex items-center gap-1.5"
                >
                  <span>Daftar</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                {user.role === "admin_space" && dashboardHref && (
                  <Link
                    href={dashboardHref}
                    className="px-4 py-2 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                  >
                    Dashboard Admin
                  </Link>
                )}
                <span className="inline-flex max-w-36 items-center gap-2 truncate rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-100 text-teal-700">
                    {user.avatarUrl ? <span aria-hidden="true" className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${user.avatarUrl}")` }} /> : <User className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span className="truncate">{profileLabel}</span>
                </span>
                <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60">
                  {isLoggingOut ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
                  Keluar
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2.5 rounded-xl text-slate-700 hover:text-teal-700 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xl transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-[400px] opacity-100 py-5" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-base font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 rounded-xl transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2.5">
            {!user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 px-4 text-center text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Masuk</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 px-4 text-center text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                {user.role === "admin_space" && dashboardHref && <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)} className="w-full rounded-xl bg-teal-50 px-4 py-3 text-center text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100">Dashboard Admin</Link>}
                <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-700"><span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-teal-100 text-teal-700">{user.avatarUrl ? <span aria-hidden="true" className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${user.avatarUrl}")` }} /> : <User className="h-4 w-4" aria-hidden="true" />}</span><span className="truncate">{profileLabel}</span></div>
                <button type="button" onClick={() => { setMobileMenuOpen(false); void handleLogout(); }} disabled={isLoggingOut} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60">{isLoggingOut ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}Keluar</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
