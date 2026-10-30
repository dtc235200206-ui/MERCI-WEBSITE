"use client";
import { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { vnd } from "@/lib/data";
import { useLang } from "@/lib/lang";
import Thumb from "@/components/Thumb";
import LangPicker from "@/components/LangPicker";

function Drawer({ open, onClose, title, closeLabel, children }: { open: boolean; onClose: () => void; title: string; closeLabel: string; children: ReactNode }) {
  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-line bg-card text-fg shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label={closeLabel} className="text-xl text-muted hover:text-fg">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </>
  );
}

export default function Drawers() {
  const { cart, remove, total, cartOpen, setCartOpen, settingsOpen, setSettingsOpen, dark, setDark } = useStore();
  const { t } = useLang();
  return (
    <>
      <Drawer open={cartOpen} onClose={() => setCartOpen(false)} title={t("h.cart")} closeLabel={t("d.close")}>
        {cart.length === 0 ? (
          <p className="mt-10 text-center text-muted">{t("d.empty")} 🛍️</p>
        ) : (
          <div className="space-y-3">
            {cart.map(({ product: p, qty }) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-soft p-3">
                <Thumb p={p} className="h-14 w-14 rounded-lg" />
                <div className="flex-1 text-sm">
                  <div className="line-clamp-1 font-medium">{p.name}</div>
                  <div className="text-muted">{vnd(p.price)} × {qty}</div>
                </div>
                <button onClick={() => remove(p.id)} aria-label={t("d.remove")} className="text-muted hover:text-fg">🗑️</button>
              </div>
            ))}
            <div className="border-t border-line pt-3">
              <div className="mb-3 flex justify-between font-bold"><span>{t("d.total")}</span><span>{vnd(total)}</span></div>
              <button className="w-full rounded-xl bg-accent py-3 font-semibold text-accent-fg hover:opacity-85">{t("d.checkout")}</button>
            </div>
          </div>
        )}
      </Drawer>
      <Drawer open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t("h.settings")} closeLabel={t("d.close")}>
        <label className="flex items-center justify-between rounded-xl bg-soft p-3">
          <span>🌙 {t("d.dark")}</span>
          <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} className="h-5 w-5 accent-white" />
        </label>
        <div className="mt-6">
          <LangPicker />
        </div>
      </Drawer>
    </>
  );
}