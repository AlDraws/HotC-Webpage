import type { Metadata } from "next";
import { RootDocument } from "../root-document";
import { DEFAULT_SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import "../globals.css";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: DEFAULT_SITE_DESCRIPTION,
};

export default function DefaultRootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
