"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Cloud, ArrowRight, HardDrive, Link2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans selection:bg-zinc-800">
      
      {/* Navbar - Ultra minimalist */}
      <nav className="border-b border-white/[0.08] bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between mx-auto px-6 max-w-6xl">
          <div className="flex items-center opacity-90 hover:opacity-100 transition-opacity ml-2">
            <img src="/assets/Stashly_logo.png" alt="Stashly Logo" className="h-14 w-auto object-contain scale-[1.7] origin-left" />
          </div>
          {status === "unauthenticated" && (
            <button 
              onClick={() => signIn("google")}
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Log in
            </button>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-32 pb-24 max-w-6xl">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-32">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-zinc-400 text-xs font-medium mb-8">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Storage 100% menggunakan Google Drive Anda
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">
            Bagikan file secara profesional. <br />
            <span className="text-zinc-500">Tanpa biaya server.</span>
          </h1>
          
          <p className="text-base md:text-lg text-zinc-400 mb-10 leading-relaxed max-w-xl mx-auto">
            Stashly adalah antarmuka minimalis untuk Google Drive Anda. Buat halaman publik yang rapi, unggah file, dan bagikan tautan khusus—semuanya tersimpan aman di akun Anda sendiri.
          </p>

          <div className="flex items-center justify-center">
            {status === "unauthenticated" ? (
              <button 
                onClick={() => {
                  setIsLoggingIn(true);
                  signIn("google");
                }}
                disabled={isLoggingIn}
                className="h-10 px-6 text-sm font-medium bg-white text-black hover:bg-zinc-200 rounded-md flex items-center transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? "Mengarahkan..." : "Mulai sekarang"}
                {!isLoggingIn && <ArrowRight className="w-4 h-4 ml-2 opacity-60 group-hover:translate-x-0.5 transition-transform" />}
              </button>
            ) : status === "loading" ? (
              <div className="h-10 px-6 rounded-md bg-white/5 animate-pulse flex items-center text-zinc-500 text-sm">
                Memuat...
              </div>
            ) : null}
          </div>
        </div>

        {/* Feature Grid - Linear Style */}
        <div className="grid md:grid-cols-3 gap-6 pt-16 border-t border-white/[0.08]">
          <div className="group p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-5 border border-white/10">
              <HardDrive className="w-4 h-4 text-zinc-300" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Penyimpanan Pribadi</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Semua file langsung masuk ke Google Drive Anda. Kami tidak menyimpan satu pun byte data Anda di server kami.
            </p>
          </div>
          
          <div className="group p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-5 border border-white/10">
              <Link2 className="w-4 h-4 text-zinc-300" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">URL Publik Khusus</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Dapatkan URL unik seperti <code className="text-xs bg-white/10 px-1 py-0.5 rounded font-mono text-zinc-300">/nama-anda</code>. Publik hanya melihat file yang Anda izinkan.
            </p>
          </div>

          <div className="group p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-5 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-zinc-300" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Kontrol Penuh</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Cabut akses, hapus file, atau sembunyikan dari publik kapan saja langsung melalui dashboard minimalis Anda.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/[0.08] mt-12">
        <div className="container mx-auto px-6 py-8 max-w-6xl text-xs text-zinc-600 flex justify-between items-center">
          <div className="flex items-center ml-2">
            <img src="/assets/Stashly_logo.png" alt="Stashly Logo" className="h-10 w-auto object-contain opacity-50 grayscale scale-[1.5] origin-left" />
          </div>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
