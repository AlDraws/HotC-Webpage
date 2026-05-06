import { redirect } from "next/navigation";
import type { AppLocale } from "@/lib/locale";

type Props = { params: Promise<{ locale: AppLocale }> };

export default async function EpisodeIndexAliasPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/episodes`);
}
