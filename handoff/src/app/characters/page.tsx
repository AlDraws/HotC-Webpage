import { Metadata } from "next";
import { PrismicNextImage } from "@prismicio/next";
import { asText } from "@prismicio/client";
import Link from "next/link";
import { createClient } from "@/prismicio";

export const metadata: Metadata = { title: "Characters" };

export default async function CharactersPage() {
  const client = createClient();
  const characters = await client.getAllByType("character");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-2 font-display text-5xl uppercase tracking-wide md:text-7xl">
        Characters
      </h1>
      <p className="mb-12 text-on-ink-mute">Meet the cast.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {characters.map((ch) => (
          <Link
            key={ch.id}
            href={`/characters/${ch.uid}`}
            className="group relative overflow-hidden rounded-sm border-2 border-ink bg-slate-900"
            style={{ boxShadow: "var(--hotc-shadow-panel-sm)" }}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              {ch.data.portrait?.url ? (
                <PrismicNextImage
                  field={ch.data.portrait}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-800 text-on-ink-faint">
                  ?
                </div>
              )}
            </div>
            <div className="p-3">
              <h2 className="text-base font-bold leading-tight">
                {asText(ch.data.name)}
              </h2>
              {ch.data.role ? (
                <p className="mt-0.5 text-xs uppercase tracking-wider text-on-ink-faint">
                  {ch.data.role}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
