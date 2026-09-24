import { LandingNav } from "@/components/landing/landing-nav";
import { CookieConsent } from "@/components/marketing/cookie-consent";
import { SiteFooter } from "@/components/marketing/site-footer";
import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh overflow-x-clip bg-[#fbfbfe] text-foreground">
      <LandingNav />
      <main>{children}</main>
      <SiteFooter />
      <CookieConsent />
    </div>
  );
}
