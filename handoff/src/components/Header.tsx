"use client";

import { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import Link from "next/link";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";

type Props = {
  settings: Content.SettingsDocument;
};

export default function Header({ settings }: Props) {
  const [open, setOpen] = useState(false);
  const nav = settings.data.navigation ?? [];

  return (
    <header className="relative z-50 w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="block h-8 w-auto md:h-10">
          {settings.data.logoLight?.url ? (
            <BrandLogo
              src={settings.data.logoLight.url}
              alt={settings.data.siteTitle ?? "HotC"}
              visualStroke={1.75}
              className="h-full w-auto"
            />
          ) : (
            <span className="text-lg font-bold tracking-tight">
              {settings.data.siteTitle ?? "HotC"}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {nav.map((n, i) => (
            <Link
              key={i}
              href={`/${n.route ?? ""}`}
              className="transition-opacity hover:opacity-70"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center md:hidden"
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="absolute inset-x-0 top-full z-50 border-t border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur md:hidden">
          {nav.map((n, i) => (
            <Link
              key={i}
              href={`/${n.route ?? ""}`}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium transition-opacity hover:opacity-70"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
