import { AppLayoutClient } from "@/components/layout/app-layout-client";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AppLayout({ children }: Props) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
