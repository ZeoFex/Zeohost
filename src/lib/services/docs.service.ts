import { prisma } from "@/lib/db";
import { DEFAULT_SMS_DOCS, SMS_DOCS_PRODUCT } from "@/lib/seed-sms-docs";

export async function ensureSmsDocs() {
  for (const page of DEFAULT_SMS_DOCS) {
    await prisma.cmsDocPage.upsert({
      where: { product_slug: { product: SMS_DOCS_PRODUCT, slug: page.slug } },
      create: {
        product: SMS_DOCS_PRODUCT,
        slug: page.slug,
        title: page.title,
        summary: page.summary,
        body: page.body,
        sortOrder: page.sortOrder,
        published: true,
      },
      update: {
        title: page.title,
        summary: page.summary,
        body: page.body,
        sortOrder: page.sortOrder,
        published: true,
      },
    });
  }
}

export async function getPublishedSmsDocs() {
  await ensureSmsDocs();
  return prisma.cmsDocPage.findMany({
    where: { product: SMS_DOCS_PRODUCT, published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getAdminSmsDocs() {
  await ensureSmsDocs();
  return prisma.cmsDocPage.findMany({
    where: { product: SMS_DOCS_PRODUCT },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}
