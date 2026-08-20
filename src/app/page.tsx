import { createClient } from "@supabase/supabase-js";
import { LandingPage } from "@/components/sections/landing-page";
import type { HomepageSettings } from "@/components/sections/landing-page";

const FALLBACK: HomepageSettings = {
  hero_title: "",
  hero_subtitle: "",
  hero_cta: "",
  show_banner: true,
  show_pengumuman: true,
  show_materi_terbaru: true,
  show_statistik: true,
  meta_title: "",
  meta_description: "",
};

async function getHomepageSettings(): Promise<HomepageSettings> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "homepage")
      .single();
    if (data?.value && typeof data.value === "object") {
      return { ...FALLBACK, ...data.value } as HomepageSettings;
    }
    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export const revalidate = 60;

export default async function HomePage() {
  const settings = await getHomepageSettings();
  return <LandingPage settings={settings} />;
}