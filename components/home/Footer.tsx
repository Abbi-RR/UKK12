import React from "react";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Share2,
  MessageSquare,
  Bookmark,
} from "lucide-react";

export default function Footer() {
  const navigationLinks = [
    { name: "Beranda", href: "#beranda" },
    { name: "Cara Reservasi", href: "#alur" },
    { name: "Katalog Ruang", href: "#ruang" },
    { name: "Keunggulan", href: "#keunggulan" },
    { name: "FAQ", href: "#faq" },
  ];

  const serviceLinks = [
    { name: "Personal Desk", href: "#ruang" },
    { name: "Private Office", href: "#ruang" },
    { name: "Meeting Room", href: "#ruang" },
    { name: "Virtual Office", href: "#" },
    { name: "Enterprise Hub", href: "#" },
  ];

  const contactInfo = [
    { icon: MapPin, text: "Jl. Soekarno Hatta No. 12, Malang, Jawa Timur" },
    { icon: Phone, text: "+62 812-3456-7890" },
    { icon: Mail, text: "support@ruangkerja.id" },
  ];

  const socialLinks = [
    { icon: Globe, href: "#", label: "Website" },
    { icon: Share2, href: "#", label: "Share" },
    { icon: MessageSquare, href: "#", label: "Community" },
    { icon: Bookmark, href: "#", label: "Bookmark" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Col 1-2: Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/30">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Ruang<span className="text-teal-400">Kerja</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Platform reservasi coworking space dan ruang kerja profesional terdepan di Indonesia. Temukan ruang nyaman untuk produktivitas dan pertumbuhan bisnis Anda.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((soc, idx) => {
                const Icon = soc.icon;
                return (
                  <a
                    key={idx}
                    href={soc.href}
                    aria-label={soc.label}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 3: Navigasi */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-4">
              Navigasi Utama
            </h4>
            <ul className="space-y-2.5 text-sm">
              {navigationLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Layanan */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-4">
              Layanan Ruang
            </h4>
            <ul className="space-y-2.5 text-sm">
              {serviceLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1"
                  >
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Kontak */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-4">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {contactInfo.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Icon className="w-4 h-4 text-teal-400 flex-shrink-0 mt-1" />
                    <span className="leading-relaxed">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RuangKerja Indonesia. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Pusat Bantuan</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

