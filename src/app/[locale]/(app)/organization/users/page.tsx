import { MembershipsPage } from "@/components/memberships/memberships-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OrganizationUsersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MembershipsPage />;
}
