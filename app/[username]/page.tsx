"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { PublicFileGrid } from "@/components/FileGrid";

export default function UserPublicPage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username ?? "");

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans selection:bg-zinc-800">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white break-all">@{username}</h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-md">
            Kumpulan file publik yang dibagikan oleh {username} melalui Stashly.
          </p>
        </div>

        <PublicFileGrid username={username} />
      </main>
    </div>
  );
}
