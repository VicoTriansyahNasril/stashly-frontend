"use client";

import { Navbar } from "@/components/Navbar";
import { FileGrid } from "@/components/FileGrid";
import { useParams } from "next/navigation";
import { Cloud } from "lucide-react";

export default function UserPublicPage() {
  const params = useParams();
  const username = params.username as string;

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans selection:bg-zinc-800">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-center mb-6">
            <Cloud className="w-8 h-8 text-zinc-400" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            @{username}
          </h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-md">
            Halaman ini berisi kumpulan file publik yang dibagikan secara langsung dari Google Drive {username}.
          </p>
        </div>
        
        <FileGrid isAdmin={false} username={username} />
      </main>
    </div>
  );
}
