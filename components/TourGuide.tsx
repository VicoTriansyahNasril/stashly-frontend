"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { EventData, Step, TooltipRenderProps } from "react-joyride";
import { X } from "lucide-react";

// Joyride memakai `window`, jadi hanya dimuat di client.
const Joyride = dynamic(() => import("react-joyride").then((mod) => mod.Joyride), { ssr: false });

const STORAGE_KEY = "stashly_has_seen_tour";

const steps: Step[] = [
  {
    target: ".tour-upload",
    content: "Selamat datang di Stashly! Mulai dengan mengunggah file pertama Anda di area ini.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: ".tour-sync",
    content: "Punya file yang sudah ada di Google Drive? Klik ini, pilih filenya, dan file langsung tampil di Stashly tanpa upload ulang.",
    placement: "left",
  },
  {
    target: ".tour-public",
    content: "Buka halaman ini untuk melihat profil publik Anda dan semua file yang Anda bagikan.",
    placement: "bottom",
  },
  {
    target: ".tour-settings",
    content: "Atur nama pengguna (URL khusus) dan susunan tampilan di menu Pengaturan ini.",
    placement: "bottom",
  },
];

const readSeen = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return true; // storage diblokir: jangan paksa tur muncul setiap kali
  }
};

export function TourGuide() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (readSeen()) return;
    // Jeda singkat agar elemen target sudah dirender
    const timer = setTimeout(() => setRun(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleEvent = ({ status }: EventData) => {
    if (status === "finished" || status === "skipped") {
      setRun(false);
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // abaikan: storage tidak tersedia
      }
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      locale={{ back: "Kembali", close: "Tutup", last: "Selesai", next: "Lanjut", skip: "Lewati Tutorial" }}
      tooltipComponent={CustomTooltip}
    />
  );
}

function CustomTooltip({ index, size, step, backProps, closeProps, primaryProps, skipProps, tooltipProps, isLastStep }: TooltipRenderProps) {
  return (
    <div {...tooltipProps} className="bg-[#18181b] border border-white/10 rounded-xl shadow-2xl p-5 max-w-[320px] sm:max-w-sm font-sans z-[10000]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-semibold text-base">
          {step.title || "Panduan"} <span className="text-xs font-normal text-zinc-500">({index + 1}/{size})</span>
        </h3>
        <button {...closeProps} className="text-zinc-500 hover:text-white transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="text-zinc-300 text-sm leading-relaxed mb-6">{step.content}</div>
      <div className="flex items-center justify-between">
        <button {...skipProps} className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-2 py-1 -ml-2 rounded hover:bg-red-400/10">
          Lewati Tutorial
        </button>
        <div className="flex gap-2">
          {index > 0 && (
            <button {...backProps} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors rounded hover:bg-white/5">
              Kembali
            </button>
          )}
          <button {...primaryProps} className="px-4 py-1.5 bg-white text-black text-xs font-medium rounded-md hover:bg-zinc-200 transition-colors">
            {isLastStep ? "Selesai" : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}
