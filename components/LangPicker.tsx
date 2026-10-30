"use client";
import { useLang } from "@/lib/lang";
import { langs } from "@/lib/i18n";

export default function LangPicker() {
  const { lang, setLang, t } = useLang();
  return (
    <div>
      <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-accent">{t("set.lang")}</p>
      <div className="space-y-2.5">
        {langs.map((l) => {
          const on = lang === l.code;
          return (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex w-full items-center justify-between border px-4 py-3.5 text-left transition ${
                on ? "border-accent bg-accent/10" : "border-line hover:border-accent/50"
              }`}
            >
              <span className="text-base">{l.name}</span>
              <span className={`flex items-center gap-3 text-xs ${on ? "text-accent" : "text-muted"}`}>
                {l.short}
                {on && (
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}