import { AttendancePage } from "@/components/attendance/attendance-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AttendanceRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AttendancePage />;
}
