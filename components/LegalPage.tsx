import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/config";

export const LAST_UPDATED = "15 Oktober 2026";

export function ContactLine() {
  return CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:text-blue-300 underline">
      {CONTACT_EMAIL}
    </a>
  ) : (
    <span>alamat email pengelola yang tercantum di halaman Google OAuth aplikasi ini</span>
  );
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-zinc-300">
      <main className="container mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <Link href="/" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Stashly
        </Link>
        <h1 className="text-3xl font-semibold text-white tracking-tight">{title}</h1>
        <p className="text-sm text-zinc-500 mt-2">Terakhir diperbarui: {LAST_UPDATED}</p>
        <div className="mt-10 space-y-8 leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_p+p]:mt-3">
          {children}
        </div>
      </main>
    </div>
  );
}
