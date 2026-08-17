import { Navbar } from "@/components/Navbar";
import { UploadDropzone } from "@/components/UploadDropzone";

export default function UploadPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Upload File</h1>
          <p className="text-muted-foreground mt-2">Upload a new file to share.</p>
        </div>
        <UploadDropzone />
      </main>
    </>
  );
}
