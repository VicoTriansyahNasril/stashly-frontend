import Link from "next/link";
import { Button } from "./ui/button";
import { Cloud } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 max-w-7xl">
        <Link href="/" className="flex items-center space-x-2">
          <Cloud className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl tracking-tight">Stashly</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/upload">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              Upload File
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
