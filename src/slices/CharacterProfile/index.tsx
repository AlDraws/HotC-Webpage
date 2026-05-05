"use client";

import { FC } from "react";
import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { type SliceComponentProps, type JSXMapSerializer } from "@prismicio/react";

import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { PrismicRichText } from "@/components/PrismicRichText";

/**
 * Props for `CharacterProfile`.
 */
export type CharacterProfileProps = SliceComponentProps<Content.CharacterProfileSlice>;

const richComponents: JSXMapSerializer = {
  heading3: ({ children }) => (
    <Heading as="h3" size="sm" className="mb-3 mt-8 first:mt-0 last:mb-0">
      {children}
    </Heading>
  ),
};

/**
 * Component for "CharacterProfile" Slices.
 */
const CharacterProfile: FC<CharacterProfileProps> = ({ slice }) => {
  const p = slice.primary;
  const header = Array.isArray(p.header) && p.header.length > 0 ? p.header[0] : undefined;

  const name = header?.name;
  const role = header?.role;
  const portrait = header?.portrait;

  const hasAttributes = Array.isArray(p.attributes) && p.attributes.some((a) => isFilled.keyText(a.label) || isFilled.keyText(a.value));
  const hasGallery = Array.isArray(p.gallery) && p.gallery.some((g) => isFilled.image(g.image));

  return (
    <section
      className="relative bg-slate-900 text-white"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <Bounded as="section" className="relative py-16 md:py-24">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[280px,1fr] md:gap-14">
          {/* Portrait */}
          {isFilled.image(portrait) ? (
            <div className="mx-auto w-full max-w-xs overflow-hidden rounded-sm bg-slate-800/50 shadow-md md:mx-0">
              <PrismicNextImage
                field={portrait}
                fallbackAlt=""
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          ) : (
            <div className="mx-auto aspect-[3/4] w-full max-w-xs rounded-sm bg-slate-800/50 md:mx-0" />
          )}

          {/* Content */}
          <div className="flex min-w-0 flex-col gap-4">
            <div>
              {isFilled.keyText(name) && (
                <Heading as="h1" size="lg" className="mb-2">
                  {name}
                </Heading>
              )}
              {isFilled.keyText(role) && (
                <p className="text-slate-200/90">{role}</p>
              )}
            </div>

            {isFilled.richText(p.bio) ? (
              <PrismicRichText field={p.bio} components={richComponents} />
            ) : null}

            {hasAttributes && (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {p.attributes.map((attr, i) => (
                  <div key={i} className="rounded-sm bg-slate-800/60 p-3">
                    {isFilled.keyText(attr.label) && (
                      <div className="text-xs uppercase tracking-wide text-slate-300/80">{attr.label}</div>
                    )}
                    {isFilled.keyText(attr.value) && (
                      <div className="text-lg text-slate-50">{attr.value}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {hasGallery && (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {p.gallery.map((item, i) => (
              <div key={i} className="overflow-hidden rounded-sm bg-slate-800/40">
                {isFilled.image(item.image) && (
                  <PrismicNextImage field={item.image} fallbackAlt="" className="h-auto w-full object-cover" />
                )}
                {isFilled.keyText(item.caption) && (
                  <div className="p-2 text-sm text-slate-200/90">{item.caption}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Bounded>
    </section>
  );
};

export default CharacterProfile;
