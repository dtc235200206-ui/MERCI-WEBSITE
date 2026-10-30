"use client";
import { useEffect } from "react";

export default function HomeChrome() {
  useEffect(() => {
    const b = document.body;
    b.setAttribute("data-home", "");
    const on = () => {
      if (window.scrollY < 40) b.setAttribute("data-top", "");
      else b.removeAttribute("data-top");
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      b.removeAttribute("data-home");
      b.removeAttribute("data-top");
    };
  }, []);
  return null;
}