import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUser } from "@/lib/usersDb";

// Số ngày giữ đăng nhập. Mỗi lần khách mở web, hạn được tính lại từ đầu.
const LOGIN_DAYS = 180;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: {
    strategy: "jwt",
    maxAge: LOGIN_DAYS * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: { signIn: "/dang-nhap", error: "/dang-nhap" },
  callbacks: {
    async signIn({ user, account }) {
      if (account && user.email) {
        await upsertUser({
          id: `${account.provider}:${account.providerAccountId}`,
          email: user.email,
          name: user.name ?? "",
          image: user.image ?? "",
          provider: account.provider,
        });
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) (token as Record<string, unknown>).uid = `${account.provider}:${account.providerAccountId}`;
      return token;
    },
    async session({ session, token }) {
      const uid = (token as Record<string, unknown>).uid as string | undefined;
      if (session.user && uid) (session.user as { id?: string }).id = uid;
      return session;
    },
  },
});