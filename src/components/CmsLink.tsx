import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { type AppLocale } from "@/lib/locale";
import { resolveLinkProps } from "@/lib/links";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  linkField: unknown;
  locale?: AppLocale;
  defaultExternalTarget?: string;
  children: ReactNode;
};

export default function CmsLink({
  linkField,
  locale,
  defaultExternalTarget,
  children,
  target,
  rel,
  ...props
}: Props) {
  const resolved = resolveLinkProps(linkField, { locale, defaultExternalTarget });
  if (!resolved) return null;

  const finalTarget = target ?? resolved.target;
  const finalRel = rel ?? (finalTarget === "_blank" ? "noopener noreferrer" : resolved.rel);

  if (resolved.isExternal) {
    return (
      <a href={resolved.href} target={finalTarget} rel={finalRel} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={resolved.href} target={finalTarget} rel={finalRel} {...props}>
      {children}
    </Link>
  );
}
