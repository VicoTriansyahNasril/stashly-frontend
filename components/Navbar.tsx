"use client";

import Link from "next/link";
import { Cloud, LayoutDashboard, LogOut } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <nav className="border-b border-white/[0.08] bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between mx-auto px-6 max-w-6xl">
        <Link href="/" className="flex items-center space-x-2.5 opacity-90 hover:opacity-100 transition-opacity">
          <Cloud className="h-5 w-5 text-zinc-100" />
          <span className="font-semibold text-sm tracking-wide text-zinc-100">Stashly</span>
        </Link>
        <div className="flex items-center space-x-4">
          {status === "authenticated" ? (
            <>
              <Link 
                href="/dashboard"
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <button 
                onClick={() => {
                  setIsProcessing(true);
                  signOut({ callbackUrl: '/' });
                }}
                disabled={isProcessing}
                className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-3.5 h-3.5" />
                {isProcessing ? "Keluar..." : "Keluar"}
              </button>
            </>
          ) : status === "unauthenticated" ? (
            <button 
              onClick={() => {
                setIsProcessing(true);
                signIn("google");
              }}
              disabled={isProcessing}
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Mengarahkan..." : "Log in"}
            </button>
          ) : (
            <div className="w-10 h-4 bg-white/5 animate-pulse rounded"></div>
          )}
        </div>
      </div>
    </nav>
  );
}
