import { Navbar } from "@/components/Navbar";
import { FileGrid } from "@/components/FileGrid";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Files</h1>
          <p className="text-muted-foreground mt-2">Browse and manage your uploaded files.</p>
        </div>
        <FileGrid />
      </main>
    </>
  );
}
