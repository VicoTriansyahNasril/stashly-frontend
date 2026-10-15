import type { Metadata } from "next";
import { ContactLine, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Kebijakan Privasi • Stashly",
  description: "Bagaimana Stashly mengelola data Anda dan data Google Drive Anda.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Kebijakan Privasi">
      <section>
        <p>
          Stashly adalah antarmuka untuk mengunggah dan membagikan file yang disimpan di Google Drive milik Anda sendiri.
          Halaman ini menjelaskan data apa yang kami akses, untuk apa, dan bagaimana kami melindunginya.
        </p>
      </section>

      <section>
        <h2>1. Data yang kami kumpulkan</h2>
        <ul>
          <li>
            <strong>Profil Google dasar</strong>: nama, alamat email, dan foto profil — untuk membuat akun dan
            menampilkan identitas Anda di aplikasi.
          </li>
          <li>
            <strong>Token akses Google</strong>: disimpan di server agar Stashly dapat mengunggah, membuka, dan menghapus
            file di Google Drive Anda atas permintaan Anda.
          </li>
          <li>
            <strong>Metadata file</strong>: nama, tipe, ukuran, tanggal, serta pengaturan berbagi (publik/privat, password
            dalam bentuk hash, dan batas waktu) untuk file yang Anda kelola lewat Stashly.
          </li>
          <li>
            <strong>Data teknis</strong>: alamat IP disimpan sementara di memori untuk pembatasan jumlah permintaan
            (rate limiting) dan tidak disimpan permanen.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Akses ke Google Drive</h2>
        <p>
          Stashly hanya meminta izin <code className="text-zinc-200">drive.file</code>. Artinya Stashly{" "}
          <strong>hanya dapat mengakses file dan folder yang dibuat melalui Stashly atau yang Anda pilih sendiri</strong>{" "}
          melalui jendela pemilih file Google (Google Picker). Stashly tidak dapat melihat atau mengubah file lain di Google
          Drive Anda.
        </p>
        <p>
          Isi file tetap tersimpan di Google Drive Anda. Server Stashly hanya meneruskan isi file saat file tersebut dibuka
          atau diunduh, dan tidak menyimpan salinannya.
        </p>
      </section>

      <section>
        <h2>3. Penggunaan data Google (Limited Use)</h2>
        <p>
          Penggunaan dan pengalihan informasi yang diterima dari Google API oleh Stashly mematuhi{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="text-blue-400 hover:text-blue-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kebijakan Data Pengguna Layanan Google API
          </a>
          , termasuk persyaratan Penggunaan Terbatas (Limited Use). Secara khusus:
        </p>
        <ul>
          <li>Data Google hanya dipakai untuk menjalankan fitur Stashly yang Anda gunakan.</li>
          <li>Data Google tidak dijual, tidak dipakai untuk iklan, dan tidak dibagikan ke pihak ketiga.</li>
          <li>Data Google tidak dibaca oleh manusia, kecuali dengan persetujuan Anda, untuk keamanan, atau karena hukum.</li>
          <li>Data Google tidak dipakai untuk melatih model kecerdasan buatan.</li>
        </ul>
      </section>

      <section>
        <h2>4. Berbagi file</h2>
        <p>
          File hanya dapat diakses orang lain jika Anda menjadikannya publik. Anda dapat melindungi tautan dengan password
          atau batas waktu, menjadikannya privat kembali, atau menghapusnya kapan saja. File yang dipindahkan ke tong sampah
          tidak dapat diakses publik dan dihapus permanen setelah 30 hari.
        </p>
      </section>

      <section>
        <h2>5. Keamanan</h2>
        <ul>
          <li>Komunikasi dienkripsi dengan HTTPS.</li>
          <li>Password tautan disimpan sebagai hash bcrypt, tidak pernah dalam bentuk asli.</li>
          <li>Akses ke Google Drive dibatasi pada izin minimum (drive.file).</li>
        </ul>
      </section>

      <section>
        <h2>6. Penghapusan data & pencabutan akses</h2>
        <p>
          Anda dapat mencabut akses Stashly kapan saja melalui{" "}
          <a
            href="https://myaccount.google.com/permissions"
            className="text-blue-400 hover:text-blue-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            pengaturan izin akun Google
          </a>
          . Untuk menghapus akun beserta seluruh metadata Anda dari Stashly, hubungi kami melalui <ContactLine />. File di
          Google Drive Anda tetap menjadi milik Anda dan tidak terhapus kecuali Anda menghapusnya.
        </p>
      </section>

      <section>
        <h2>7. Kontak</h2>
        <p>
          Pertanyaan tentang kebijakan ini dapat dikirim ke <ContactLine />.
        </p>
      </section>
    </LegalPage>
  );
}
