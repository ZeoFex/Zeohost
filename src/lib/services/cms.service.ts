import { prisma } from "@/lib/db";
import { withDbRetry } from "@/lib/db-postgres";
import { parseJson } from "@/lib/utils";
import { DEFAULT_HOME, DEFAULT_HOME_STATS, seedHomepageCms } from "@/lib/seed-homepage-cms";

export type HomeStat = { value: string; label: string };

export async function ensureHomepageCms() {
  await withDbRetry(() => seedHomepageCms(prisma as never));
}

function publicHomeStats(raw: string | null | undefined): HomeStat[] {
  const stats = parseJson<HomeStat[]>(raw ?? "[]", DEFAULT_HOME_STATS);
  return stats.map((row) => ({
    ...row,
    label: row.label
      .replace(/\bname\.com\b/gi, "domain")
      .replace(/\bnamecom\b/gi, "domain")
      .replace(/\s+/g, " ")
      .trim(),
  }));
}

function fallbackHomepageCms() {
  return {
    home: DEFAULT_HOME,
    stats: publicHomeStats(DEFAULT_HOME.statsJson),
    partners: [] as Awaited<ReturnType<typeof prisma.cmsPartnerCard.findMany>>,
  };
}

export async function getHomepageCms() {
  try {
    await ensureHomepageCms().catch((error) => {
      console.error("Homepage CMS seed skipped", error);
    });
    const home = await withDbRetry(() => prisma.cmsHome.findUnique({ where: { slug: "home" } }));
    const partners = await withDbRetry(() =>
      prisma.cmsPartnerCard.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
    );
    return {
      home: home ?? DEFAULT_HOME,
      stats: publicHomeStats(home?.statsJson),
      partners,
    };
  } catch (error) {
    console.error("getHomepageCms falling back to defaults", error);
    return fallbackHomepageCms();
  }
}

export async function getAdminHomepageCms() {
  await ensureHomepageCms();
  const home = await prisma.cmsHome.findUniqueOrThrow({ where: { slug: "home" } });
  const partners = await prisma.cmsPartnerCard.findMany({ orderBy: { sortOrder: "asc" } });
  return {
    home,
    stats: parseJson<HomeStat[]>(home.statsJson, DEFAULT_HOME_STATS),
    partners,
  };
}
