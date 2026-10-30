"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { dict, locales, Lang } from "@/lib/i18n";
import { extra } from "@/lib/i18n-extra";
import { acct } from "@/lib/i18n-account";

type Vars = Record<string, string | number>;
type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Vars) => string;
  locale: string;
};

const C = createContext<Ctx>({ lang: "vi", setLang: () => {}, t: (k) => k, locale: "vi-VN" });
export const useLang = () => useContext(C);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setL] = useState<Lang>("vi");

  useEffect(() => {
    const s = localStorage.getItem("merci-lang") as Lang | null;
    if (s && s in dict) setL(s);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setL(l);
    localStorage.setItem("merci-lang", l);
  };

  const t = (key: string, vars?: Vars) => {
    let s =
      acct[lang][key] ??
      extra[lang][key] ??
      dict[lang][key] ??
      acct.vi[key] ??
      extra.vi[key] ??
      dict.vi[key] ??
      key;
    if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
    return s;
  };

  return <C.Provider value={{ lang, setLang, t, locale: locales[lang] }}>{children}</C.Provider>;
}