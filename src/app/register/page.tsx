import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { isGithubConfigured } from "@/lib/github/config";
import { getHomepageCms } from "@/lib/services/cms.service";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Zeohost account to buy domains, manage DNS, and launch hosting.",
  alternates: { canonical: "https://www.zeohost.store/register" },
  openGraph: {
    title: "Create your Zeohost account",
    description: "Get started with domain search, checkout, and hosting tools.",
    url: "https://www.zeohost.store/register",
  },
};

export default async function RegisterPage() {
  const cms = await getHomepageCms().catch(() => null);
  return (
    <Suspense>
      <AuthForm
        mode="register"
        githubEnabled={isGithubConfigured()}
        sideImageUrl={cms?.home.heroImageUrl || undefined}
      />
    </Suspense>
  );
}
