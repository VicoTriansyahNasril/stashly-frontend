import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { Adapter } from "next-auth/adapters";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

/**
 * `drive.file`: Stashly hanya bisa mengakses file yang dibuat lewat Stashly atau yang dipilih
 * pengguna lewat Google Picker — bukan seluruh isi Google Drive. Scope ini tidak termasuk
 * kategori "restricted", sehingga aplikasi bisa dipublikasikan tanpa audit keamanan CASA.
 */
const GOOGLE_SCOPES = ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.file"].join(" ");

const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }) as Adapter,
  // Sesi database: backend memverifikasi cookie sesi langsung ke tabel `session`.
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: GOOGLE_SCOPES,
        },
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        (session.user as typeof session.user & { id: string }).id = user.id;
      }
      return session;
    },
  },
  events: {
    /**
     * NextAuth hanya menyimpan token saat akun pertama kali ditautkan. Perbarui setiap login
     * agar backend selalu memakai refresh token terbaru (mis. setelah scope berubah ke drive.file
     * atau pengguna mencabut lalu memberi izin ulang).
     */
    async signIn({ account }) {
      if (account?.provider !== "google" || !account.refresh_token) return;
      try {
        await db
          .update(schema.accounts)
          .set({
            refresh_token: account.refresh_token,
            access_token: account.access_token ?? null,
            expires_at: account.expires_at ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
            token_type: account.token_type ?? null,
          })
          .where(
            and(
              eq(schema.accounts.provider, account.provider),
              eq(schema.accounts.providerAccountId, account.providerAccountId),
            ),
          );
      } catch (error) {
        console.error("[auth] gagal memperbarui token Google", error);
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
