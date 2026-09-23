import { AuthShell } from "@/components/auth/auth-shell";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return <AuthShell>{children}</AuthShell>;
}
