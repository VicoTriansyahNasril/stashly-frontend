"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Trash2, Settings } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { ConfirmDialog } from "./CustomDialog";
import { SettingsDialog } from "./SettingsDialog";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    setIsProcessing(true);
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <nav className="border-b border-white/[0.05] bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between mx-auto px-6 max-w-6xl">
          <Link href="/" aria-label="Beranda Stashly" className="flex items-center opacity-90 hover:opacity-100 transition-opacity ml-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo statis kecil */}
            <img src="/assets/Stashly_logo.png" alt="Stashly Logo" className="h-14 w-auto object-contain scale-[1.7] origin-left" />
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-5">
            {status === "authenticated" ? (
              <>
                <Link 
                  href="/dashboard"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                
                <Link 
                  href="/dashboard/trash"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Tong Sampah</span>
                </Link>
                
                <div className="hidden sm:block h-5 w-px bg-white/10 mx-1 sm:mx-2"></div>
                
                <div className="flex items-center gap-1 sm:gap-3">
                  <div className="flex items-center gap-2">
                    {session?.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- avatar Google eksternal
                      <img src={session.user.image} alt={session.user.name || "User"} referrerPolicy="no-referrer" className="w-7 h-7 rounded-full border border-white/10" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold">
                        {session?.user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-zinc-200 hidden sm:block">
                      {session?.user?.name?.split(" ")[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="tour-settings text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 p-2 sm:px-2.5 sm:py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                    title="Pengaturan"
                    aria-label="Pengaturan"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    disabled={isProcessing}
                    className="text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-400/10 p-2 sm:px-2.5 sm:py-1.5 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">{isProcessing ? "Keluar..." : "Keluar"}</span>
                  </button>
                </div>
              </>
            ) : status === "unauthenticated" ? (
              <button 
                onClick={() => {
                  setIsProcessing(true);
                  signIn("google");
                }}
                disabled={isProcessing}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Mengarahkan..." : "Log in"}
              </button>
            ) : (
              <div className="flex gap-4 items-center">
                <div className="w-20 h-4 bg-white/5 animate-pulse rounded"></div>
                <div className="w-8 h-8 bg-white/5 animate-pulse rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari sesi ini? Anda harus login kembali menggunakan Google untuk mengakses dashboard."
        confirmText="Ya, Keluar"
        isDestructive={true}
        onConfirm={handleLogout}
      />

      <SettingsDialog 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  );
}
