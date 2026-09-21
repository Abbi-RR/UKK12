"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  Zap,
  ShieldCheck,
} from "lucide-react";

type City = "Malang" | "Surabaya" | "Jakarta";
type WorkspaceType = "Personal Desk" | "Private Office" | "Meeting Room";

interface WorkspaceInfo {
  name: string;
  price: string;
  slots: number;
  status: "Tersedia" | "Hampir Penuh" | "Penuh";
  features: string[];
}

export default function HeroSection() {
  const [selectedCity, setSelectedCity] = useState<City>("Malang");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedType, setSelectedType] = useState<WorkspaceType>("Personal Desk");
  const [checked, setChecked] = useState<boolean>(false);

  const db: Record<City, Record<WorkspaceType, WorkspaceInfo>> = {
    Malang: {
      "Personal Desk": {
        name: "Personal Hot Desk - Malang Hub",
        price: "Rp 50.000 / hari",
        slots: 12,
        status: "Tersedia",
        features: ["High-speed WiFi", "Power Outlet", "Free Coffee & Tea"],
      },
      "Private Office": {
        name: "Executive Suite (4 Persons)",
        price: "Rp 350.000 / hari",
        slots: 2,
        status: "Hampir Penuh",
        features: ["Private AC", "Whiteboard", "Dedicated Locker"],
      },
      "Meeting Room": {
        name: "Collaboration Room Alpha",
        price: "Rp 150.000 / jam",
        slots: 0,
        status: "Penuh",
        features: ["Smart TV", "Conference Mic", "Projector"],
      },
    },
    Surabaya: {
      "Personal Desk": {
        name: "Flexi Desk - Surabaya Center",
        price: "Rp 75.000 / hari",
        slots: 25,
        status: "Tersedia",
        features: ["Ergonomic Chair", "High-speed WiFi", "Access to Lounge"],
      },
      "Private Office": {
        name: "Team Pod (6 Persons)",
        price: "Rp 550.000 / hari",
        slots: 4,
        status: "Tersedia",
        features: ["Soundproof", "Private Coffee Machine", "Secure Keycard"],
      },
      "Meeting Room": {
        name: "Boardroom Beta",
        price: "Rp 250.000 / jam",
        slots: 1,
        status: "Hampir Penuh",
        features: ["Ultra HD Display", "Video Conference", "Catering Service"],
      },
    },
    Jakarta: {
      "Personal Desk": {
        name: "Hot Desk - Sudirman Tower",
        price: "Rp 100.000 / hari",
        slots: 8,
        status: "Hampir Penuh",
        features: ["City View", "High-speed WiFi", "Printing Service"],
      },
      "Private Office": {
        name: "Director Suite (8 Persons)",
        price: "Rp 950.000 / hari",
        slots: 1,
        status: "Hampir Penuh",
        features: ["Private Bathroom", "Executive Lounge", "Dedicated Receptionist"],
      },
      "Meeting Room": {
        name: "Grand Conference Hall",
        price: "Rp 500.000 / jam",
        slots: 0,
        status: "Penuh",
        features: ["Full AV System", "Stage Setup", "Live Streaming Ready"],
      },
    },
  };

  const cur = db[selectedCity][selectedType];

  return (
    <section id="beranda" className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#f8f9ff] overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT SIDE */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0fdfa] border border-teal-200/60 text-teal-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Coworking Space Modern</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Ruang Kerja Nyaman untuk <span className="text-teal-600">Ide yang Lebih Besar</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl">
              Tingkatkan produktivitas kerja dan kolaborasi tim Anda di lingkungan profesional yang dilengkapi fasilitas berkecepatan tinggi, lokasi strategis di berbagai kota, dan sistem reservasi instan.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <Link
                href="/member/booking"
                className="px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-[#0f766e] text-white font-semibold text-center shadow-lg shadow-teal-600/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Reservasi Sekarang</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#ruangan"
                className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-teal-700 font-semibold text-center border border-slate-200/80 shadow-sm transition-all duration-200"
              >
                Lihat Ruangan
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200/75 w-full">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">3+</span>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">Kota Strategis</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">500+</span>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">Professional Member</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">99.9%</span>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">Uptime & WiFi</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Quick Hub Explorer */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-8 relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f0fdfa] text-teal-600 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Quick Hub Explorer</h3>
                    <p className="text-xs text-slate-500">Cek ketersediaan ruang secara real-time</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-200/50">
                  Live Check
                </span>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setChecked(true); }} className="space-y-5">
                {/* 1. Cabang */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>Pilih Cabang / Kota</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Malang", "Surabaya", "Jakarta"] as City[]).map((city) => (
                      <button
                        type="button"
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setChecked(false);
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-150 ${
                          selectedCity === city
                            ? "bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/20"
                            : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Tanggal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Pilih Tanggal</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setChecked(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 text-sm font-medium text-slate-800 bg-slate-50/50 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
                  />
                </div>

                {/* 3. Tipe */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span>Tipe Workspace</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Personal Desk", "Private Office", "Meeting Room"] as WorkspaceType[]).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          setChecked(false);
                        }}
                        className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-semibold border text-center transition-all duration-150 ${
                          selectedType === type
                            ? "bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/20"
                            : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-teal-700 text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-slate-900/10 flex items-center justify-center gap-2"
                >
                  <span>Cek Ketersediaan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Status & Ketersediaan */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="bg-[#f0fdfa]/60 rounded-xl p-4 border border-teal-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-0.5">
                        {selectedCity} Hub • {selectedDate}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {cur.name}
                      </h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        cur.status === "Tersedia"
                          ? "bg-emerald-100 text-emerald-800"
                          : cur.status === "Hampir Penuh"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {cur.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-teal-100/60 text-xs">
                    <div>
                      <span className="text-slate-500 block">Tarif Estimasi</span>
                      <span className="font-bold text-slate-900 text-sm">{cur.price}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Slot Tersedia</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {cur.slots} {cur.slots > 0 ? "Unit/Meja" : "Habis"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {cur.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] bg-white text-slate-600 px-2 py-0.5 rounded-md border border-teal-100"
                      >
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        {feat}
                      </span>
                    ))}
                  </div>

                  {checked && (
                    <div className="mt-3 pt-3 border-t border-teal-200/60 flex items-center gap-2 text-xs text-teal-800 font-medium">
                      <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>Slot terverifikasi untuk tanggal {selectedDate}. Silakan lanjut reservasi!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
