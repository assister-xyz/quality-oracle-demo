import { cookies } from "next/headers";
import { LandingPageClient } from "@/components/landing/landing-client";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const variant = (cookieStore.get("ab_variant")?.value || "a") as
    | "a"
    | "b"
    | "c";

  return <LandingPageClient variant={variant} />;
}
