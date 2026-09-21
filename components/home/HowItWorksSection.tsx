import React from "react";
import {
  Search,
  CalendarCheck,
  Ticket,
  QrCode,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Cari",
      desc: "Cari ruang kerja sesuai kebutuhan Anda dari pilihan personal desk hingga private office.",
    },
    {
      number: "02",
      icon: CalendarCheck,
      title: "Atur & Bayar",
      desc: "Pilih jadwal, tanggal reservasi, dan lakukan pembayaran secara aman dan instan.",
    },
    {
      number: "03",
      icon: Ticket,
      title: "E-Ticket",
      desc: "Dapatkan tiket reservasi secara digital langsung di aplikasi dan email Anda.",
    },
    {
      number: "04",
      icon: QrCode,
      title: "Scan QR",
      desc: "Scan QR code saat tiba di lokasi untuk langsung check-in cepat tanpa antre.",
    },
  ];

  return (
    <section id="alur" className="py-20 md:py-28 bg-[#f8f9ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0fdfa] border border-teal-200/60 text-teal-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Alur Praktis</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Cara Reservasi di <span className="text-teal-600">RuangKerja</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Hanya butuh 4 langkah mudah untuk mulai bekerja nyaman dengan fasilitas coworking space terbaik.
          </p>
        </div>

        {/* 4 Langkah: Mobile 1 col, Tablet 2 col, Desktop 4 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#f0fdfa] text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200 shadow-sm shadow-teal-600/10">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-teal-600/30 transition-colors">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner Tiket Simulasi */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Keterangan */}
            <div className="max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold mb-3">
                <Ticket className="w-3.5 h-3.5 text-teal-600" />
                <span>Simulasi E-Ticket Digital</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
                Check-in Instan Tanpa Antre
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Setelah pembayaran selesai, Anda langsung mendapatkan e-ticket berisikan kode QR terenkripsi untuk akses mandiri ke ruang kerja.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-600" /> Tanpa tiket fisik
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-600" /> Validasi instan
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-600" /> Akses otomatis
                </span>
              </div>
            </div>

            {/* Simulasi Card Tiket */}
            <div className="w-full lg:w-auto max-w-md bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-700/80">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
                <div>
                  <span className="text-[10px] text-teal-400 uppercase font-bold tracking-widest block">
                    RuangKerja Pass
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    Personal Desk #MLG-04
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                  Confirmed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Lokasi</span>
                  <span className="font-semibold text-slate-100 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" /> Malang Hub
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Waktu Akses</span>
                  <span className="font-semibold text-slate-100 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" /> Full Day Pass
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center">
                    <QrCode className="w-9 h-9 text-slate-900" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kode Booking</span>
                    <span className="font-mono text-xs font-bold text-teal-300 tracking-wider">
                      RK-MLG-8921
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Status Check-in</span>
                  <span className="text-xs font-semibold text-emerald-400">Siap Scan</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
