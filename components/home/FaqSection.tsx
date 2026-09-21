"use client";

import React, { useState } from "react";
import { ChevronDown, Sparkles, HelpCircle } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: "faq-1",
    question: "Bagaimana cara melakukan reservasi?",
    answer: "Anda dapat memilih ruang kerja yang diinginkan pada katalog, menentukan tanggal & durasi, lalu melanjutkan ke proses pembayaran. Setelah pembayaran terkonfirmasi, e-ticket digital beserta QR code akan otomatis diterbitkan.",
  },
  {
    id: "faq-2",
    question: "Apakah saya bisa memilih tanggal dan waktu?",
    answer: "Ya, tentu saja. Melalui widget Quick Hub Explorer di beranda atau saat proses pemesanan, Anda dapat secara fleksibel menentukan tanggal, jam mulai, dan durasi penggunaan sesuai kebutuhan.",
  },
  {
    id: "faq-3",
    question: "Apa saja tipe workspace yang tersedia?",
    answer: "RuangKerja menyediakan 3 tipe workspace utama: Personal Desk untuk kerja individu fleksibel, Private Office untuk tim eksklusif, serta Meeting Room berfasilitas audio-visual lengkap untuk rapat profesional.",
  },
  {
    id: "faq-4",
    question: "Bagaimana cara mendapatkan e-ticket?",
    answer: "E-ticket digital akan langsung dikirimkan ke email terdaftar Anda dan dapat diakses kapan saja melalui halaman dashboard akun RuangKerja Anda setelah transaksi pembayaran berhasil.",
  },
  {
    id: "faq-5",
    question: "Apakah reservasi dapat dibatalkan?",
    answer: "Pembatalan dan penjadwalan ulang (reschedule) dapat dilakukan melalui menu riwayat reservasi selambat-lambatnya 4 jam sebelum jadwal penggunaan ruang dimulai, sesuai dengan syarat dan ketentuan yang berlaku.",
  },
  {
    id: "faq-6",
    question: "Apakah tersedia meeting room?",
    answer: "Ya, kami menyediakan Meeting Room berkapasitas 6 hingga 12 orang lengkap dengan Smart TV, perangkat konferensi, papan tulis, serta kedap suara untuk kelancaran rapat Anda.",
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#f8f9ff]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0fdfa] border border-teal-200/60 text-teal-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Pertanyaan Umum</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Frequently Asked <span className="text-teal-600">Questions</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Temukan jawaban atas pertanyaan seputar layanan, reservasi, dan fasilitas di RuangKerja.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_DATA.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-teal-300 shadow-sm ring-1 ring-teal-500/20"
                    : "border-slate-200/70 shadow-sm hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                        isOpen
                          ? "bg-teal-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 bg-teal-50 text-teal-700" : "bg-slate-50"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 animate-fadeIn">
                    <p className="pl-11">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
