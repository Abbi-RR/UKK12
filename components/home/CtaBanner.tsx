import React from "react";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="py-20 md:py-28 bg-[#f8f9ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dark Teal CTA Box */}
        <div className="bg-[#0f766e] rounded-2xl p-8 sm:p-12 md:p-16 text-white relative overflow-hidden shadow-xl">
          
          {/* Subtle background pattern decoration */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-teal-800/40 blur-2xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-teal-500/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-800/60 border border-teal-500/40 text-teal-100 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Mulai Produktivitas Anda Hari Ini</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Siap Bekerja Lebih Produktif di <span className="text-teal-200">RuangKerja</span>?
            </h2>

            <p className="text-teal-100 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan profesional, freelancer, dan tim modern lainnya. Pesan meja atau ruang meeting impian Anda sekarang juga.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#ruang"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-teal-800 font-bold text-sm sm:text-base hover:bg-teal-50 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Mulai Reservasi</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#ruang"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-teal-800/80 hover:bg-teal-800 text-white font-semibold text-sm sm:text-base border border-teal-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Lihat Katalog Ruang</span>
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-teal-700/60 flex flex-wrap items-center justify-center gap-6 text-xs text-teal-200 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-300" /> Pembayaran Aman & Instan
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-300" /> E-Ticket QR Code Otomatis
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-300" /> Layanan Support 24/7
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
