import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Ketentuan Layanan • Stashly",
  description: "Ketentuan penggunaan layanan Stashly.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Ketentuan Layanan">
      <section>
        <p>Dengan menggunakan Stashly, Anda menyetujui ketentuan berikut.</p>
      </section>

      <section>
        <h2>1. Layanan</h2>
        <p>
          Stashly membantu Anda mengunggah file ke Google Drive milik Anda dan membagikannya melalui tautan. File
          tersimpan di akun Google Drive Anda dan tunduk pada ketentuan Google.
        </p>
      </section>

      <section>
        <h2>2. Tanggung jawab pengguna</h2>
        <ul>
          <li>Anda bertanggung jawab atas file yang Anda unggah dan bagikan.</li>
          <li>
            Dilarang membagikan konten yang melanggar hukum, hak cipta, privasi orang lain, atau berisi malware.
          </li>
          <li>Jaga kerahasiaan password tautan yang Anda buat.</li>
        </ul>
      </section>

      <section>
        <h2>3. Batasan</h2>
        <p>
          Stashly menerapkan batas ukuran file, kuota, dan pembatasan jumlah permintaan untuk menjaga keamanan layanan.
          Kami dapat menonaktifkan tautan atau akun yang disalahgunakan.
        </p>
      </section>

      <section>
        <h2>4. Ketersediaan & jaminan</h2>
        <p>
          Layanan disediakan &quot;sebagaimana adanya&quot;. Kami berupaya menjaga layanan tetap tersedia dan aman, namun
          tidak menjamin layanan bebas gangguan. Simpan cadangan file penting Anda.
        </p>
      </section>

      <section>
        <h2>5. Privasi</h2>
        <p>
          Pengelolaan data dijelaskan di{" "}
          <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
            Kebijakan Privasi
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>6. Kontak</h2>
        <p>
          Hubungi kami melalui <ContactLine />.
        </p>
      </section>
    </LegalPage>
  );
}
