import React from "react";
import { Laptop, Building2, Users, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface WorkspacePlan {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  price: string;
  period: string;
  capacity: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

const WORKSPACE_PLANS: WorkspacePlan[] = [
  {
    id: "personal-desk",
    name: "Personal Desk",
    badge: "Fleksibel",
    price: "Rp 25.000",
    period: "/ jam",
    capacity: "1 Orang",
    description: "Meja kerja individu tenang dan ergonomis, cocok untuk freelancer & remote worker.",
    icon: Laptop,
    features: [
      "Ergonomic Chair & Desk",
      "High Speed WiFi 100 Mbps",
      "Dedicated Power Outlet",
      "Free Flow Mineral Water & Coffee",
    ],
  },
  {
    id: "private-office",
    name: "Private Office",
    badge: "Paling Populer",
    popular: true,
    price: "Rp 150.000",
    period: "/ jam",
    capacity: "4 - 8 Orang",
    description: "Ruang kantor privat eksklusif dengan privasi penuh untuk tim dan proyek intensif.",
    icon: Building2,
    features: [
      "Akses Smart Door Lock",
      "AC Mandiri & Glass Board",
      "Prioritas Internet Dedicated",
      "Free Beverage & Snacks",
    ],
  },
  {
    id: "meeting-room",
    name: "Meeting Room",
    badge: "Kolaboratif",
    price: "Rp 100.000",
    period: "/ jam",
    capacity: "6 - 12 Orang",
    description: "Ruang pertemuan profesional berfasilitas audio visual lengkap untuk presentasi.",
    icon: Users,
    features: [
      "Smart TV 55 Inch & Wireless Display",
      "Conference Mic & Camera",
      "Papan Tulis Kaca & Spidol",
      "Ruang Kedap Suara Nyaman",
    ],
  },
];

export default function SpaceCatalogSection() {
  return (
    <section id="ruang" className="py-20 md:py-28 bg-[#f8f9ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0fdfa] border border-teal-200/60 text-teal-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Pilihan Ruang Fleksibel</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Pilih Workspace Sesuai Kebutuhan
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Pilihan ruang berstandar premium dengan fasilitas lengkap untuk produktivitas maksimal Anda.
          </p>
        </div>

        {/* 3 Cards: Mobile 1 col, Tablet 2 col, Desktop 3 col */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {WORKSPACE_PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between p-7 relative group ${
                  plan.popular
                    ? "border-teal-600 shadow-md ring-1 ring-teal-600/20"
                    : "border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-7">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        plan.popular
                          ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mt-2 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#f0fdfa] text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                      Kapasitas: {plan.capacity}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-sm font-medium text-slate-500 ml-1">
                      {plan.period}
                    </span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      Fasilitas Unggulan:
                    </span>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-teal-600 hover:bg-[#0f766e] text-white shadow-sm shadow-teal-600/25"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <span>Reservasi</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
