import React from "react";
import {
  Wifi,
  Smile,
  Users,
  Zap,
  Wind,
  Coffee,
  ShieldCheck,
  CalendarCheck,
  Sparkles,
} from "lucide-react";

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FEATURES_LIST: FeatureItem[] = [
  {
    id: "wifi",
    title: "WiFi Berkecepatan Tinggi",
    description: "Koneksi internet dedicated berkecepatan tinggi bebas lag untuk kelancaran kerja dan video conference.",
    icon: Wifi,
  },
  {
    id: "comfortable",
    title: "Ruang Nyaman",
    description: "Desain interior modern, pencahayaan optimal, dan kursi ergonomis untuk menjaga produktivitas sepanjang hari.",
    icon: Smile,
  },
  {
    id: "meeting-room",
    title: "Meeting Room",
    description: "Ruang rapat profesional berfasilitas audio-visual modern siap pakai untuk presentasi dan diskusi tim.",
    icon: Users,
  },
  {
    id: "power-outlet",
    title: "Power Outlet",
    description: "Tersedia stopkontak di setiap meja kerja, memudahkan pengisian daya perangkat tanpa batasan.",
    icon: Zap,
  },
  {
    id: "ac",
    title: "AC",
    description: "Pengatur suhu ruangan AC sentral dan mandiri yang sejuk dan nyaman di setiap sudut hub.",
    icon: Wind,
  },
  {
    id: "pantry",
    title: "Pantry",
    description: "Fasilitas pantry lengkap dengan kopi, teh, dan air mineral bebas refill gratis untuk pengunjung.",
    icon: Coffee,
  },
  {
    id: "security",
    title: "Keamanan",
    description: "Sistem keamanan 24/7, CCTV di area publik, serta akses digital pass untuk ketenangan Anda.",
    icon: ShieldCheck,
  },
  {
    id: "online-booking",
    title: "Reservasi Online",
    description: "Pesan ruang kerja secara instan melalui sistem online realtime lengkap dengan e-ticket QR code.",
    icon: CalendarCheck,
  },
];

export default function FeaturesSection() {
  return (
    <section id="keunggulan" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0fdfa] border border-teal-200/60 text-teal-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Keunggulan Utama</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Kenapa Memilih <span className="text-teal-600">RuangKerja</span>?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Kami menyediakan fasilitas dan layanan terbaik untuk mendukung segala kebutuhan produktivitas dan pertumbuhan bisnis Anda.
          </p>
        </div>

        {/* Feature Grid: Mobile 1 col, Tablet 2 col, Desktop 4 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES_LIST.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-[#f8f9ff] rounded-2xl border border-slate-200/70 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#f0fdfa] text-teal-600 flex items-center justify-center mb-5 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200 shadow-sm shadow-teal-600/10">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
