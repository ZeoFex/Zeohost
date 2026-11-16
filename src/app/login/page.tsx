import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { isGithubConfigured } from "@/lib/github/config";
import { getHomepageCms } from "@/lib/services/cms.service";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Zeohost to manage domains, DNS, hosting, and SMS.",
  alternates: { canonical: "https://www.zeohost.store/login" },
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  const cms = await getHomepageCms().catch(() => null);
  return (
    <Suspense>
      <AuthForm
        mode="login"
        githubEnabled={isGithubConfigured()}
        sideImageUrl={cms?.home.heroImageUrl || undefined}
      />
    </Suspense>
  );
}
