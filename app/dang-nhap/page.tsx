"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLang } from "@/lib/lang";

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" role="img" aria-label="Google">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const AppleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="Apple">
    <path
      fill="#ffffff"
      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const { status } = useSession();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/tai-khoan");
  }, [status, router]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error")) setError(true);
  }, []);

  const google = () => {
    setBusy(true);
    signIn("google", { redirectTo: "/tai-khoan" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-12 text-fg">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 block text-center font-serif text-4xl font-medium tracking-[0.4em] text-accent">
          MERCI
        </Link>
        <h1 className="text-center font-serif text-4xl font-normal leading-tight">{t("a.login.title")}</h1>
        <p className="mb-8 mt-3 text-center text-sm leading-relaxed text-muted">{t("a.login.sub")}</p>

        {error && <p className="mb-4 border border-red-400/40 p-3 text-center text-sm text-red-300">{t("a.login.err")}</p>}

        <button
          onClick={google}
          disabled={busy}
          className="mb-3 flex w-full items-center justify-center gap-3 border border-[#3a352b] bg-[#131314] py-3.5 text-[15px] transition hover:border-accent disabled:opacity-60"
        >
          <GoogleLogo />
          {t("a.login.google")}
        </button>

        <button
          disabled
          className="mb-6 flex w-full cursor-not-allowed items-center justify-center gap-3 border border-[#2b2924] bg-black py-3.5 text-[15px] opacity-60"
        >
          <AppleLogo />
          {t("a.login.apple")}
          <span className="ml-1 rounded-full border border-accent/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">{t("a.login.soon")}</span>
        </button>

        <div className="mb-6 flex items-center gap-4 text-xs tracking-[0.2em] text-muted">
          <div className="h-px flex-1 bg-line" />
          {t("a.login.or")}
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="mb-3 flex opacity-60">
          <div className="border border-r-0 border-line px-4 py-3.5 text-[15px] text-accent">+84</div>
          <input disabled placeholder={t("a.login.phone")} className="min-w-0 flex-1 border border-line bg-transparent px-4 py-3.5 text-[15px]" />
        </div>
        <button disabled className="w-full cursor-not-allowed bg-accent/50 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-accent-fg">
          {t("a.login.otp")} · {t("a.login.soon")}
        </button>

        <p className="mt-8 text-center text-xs leading-relaxed text-muted">{t("a.login.terms")}</p>
        <Link href="/" className="mt-6 block text-center text-sm text-muted hover:text-accent">
          {t("a.login.back")}
        </Link>
      </div>
    </div>
  );
}