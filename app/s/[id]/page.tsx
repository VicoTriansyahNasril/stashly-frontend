import type { Metadata } from "next";
import { PublicShareView } from "@/components/PublicShareView";

export const metadata: Metadata = {
  title: "File dibagikan • Stashly",
  // Halaman share bersifat pribadi; jangan diindeks mesin pencari.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function PublicSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 bg-gradient-to-br from-zinc-950 to-zinc-900">
      <PublicShareView fileId={id} />
    </div>
  );
}
