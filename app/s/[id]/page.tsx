import { PublicShareView } from '@/components/PublicShareView';

export default function PublicSharePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 bg-gradient-to-br from-zinc-950 to-zinc-900">
      <PublicShareView fileId={params.id} />
    </div>
  );
}
