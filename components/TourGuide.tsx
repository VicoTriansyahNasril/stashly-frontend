"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Step } from "react-joyride";
import { X } from "lucide-react";

// Joyride uses window, so we dynamically import it with ssr: false
const Joyride = dynamic<any>(() => import("react-joyride").then((mod: any) => mod.Joyride), { ssr: false });

export function TourGuide() {
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenTour = localStorage.getItem('stashly_has_seen_tour');
    if (!hasSeenTour) {
      // Slight delay to ensure elements are rendered
      setTimeout(() => setRun(true), 500);
    }
  }, []);

  const steps: any[] = [
    {
      target: '.tour-upload',
      content: 'Selamat datang di Stashly! Mulai dengan mengunggah file pertama Anda di area ini.',
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: '.tour-sync',
      content: 'Punya file yang sudah ada di Google Drive? Klik ini untuk menyinkronkannya tanpa perlu upload ulang!',
      placement: 'left',
    },
    {
      target: '.tour-public',
      content: 'Buka halaman ini untuk melihat profil publik Anda dan membagikan semua file yang bersifat publik.',
      placement: 'bottom',
    },
    {
      target: '.tour-settings',
      content: 'Atur nama pengguna (URL khusus) dan ubah susunan tampilan di menu Pengaturan ini.',
      placement: 'bottom',
    }
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses = ['finished', 'skipped'];
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('stashly_has_seen_tour', 'true');
    }
  };

  if (!isMounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      callback={handleJoyrideCallback}
      locale={{
        back: 'Kembali',
        close: 'Tutup',
        last: 'Selesai',
        next: 'Lanjut',
        skip: 'Skip Tutorial'
      }}
      tooltipComponent={(props: any) => <CustomTooltip {...props} />}
    />
  );
}

function CustomTooltip({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
}: any) {
  return (
    <div {...tooltipProps} className="bg-[#18181b] border border-white/10 rounded-xl shadow-2xl p-5 max-w-[320px] sm:max-w-sm font-sans z-[10000]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-semibold text-base">{step.title || 'Panduan'}</h3>
        <button {...closeProps} className="text-zinc-500 hover:text-white transition-colors p-1" title="Tutup">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="text-zinc-300 text-sm leading-relaxed mb-6">
        {step.content}
      </div>
      <div className="flex items-center justify-between">
        <button {...skipProps} className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-2 py-1 -ml-2 rounded hover:bg-red-400/10">
          Skip Tutorial
        </button>
        <div className="flex gap-2">
          {index > 0 && (
            <button {...backProps} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors rounded hover:bg-white/5">
              Kembali
            </button>
          )}
          <button {...primaryProps} className="px-4 py-1.5 bg-white text-black text-xs font-medium rounded-md hover:bg-zinc-200 transition-colors">
            {isLastStep ? 'Selesai' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  );
}
