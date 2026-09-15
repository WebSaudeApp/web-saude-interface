import type { PropsWithChildren } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import Alert from "@/components/common/Alert";
import { publicRoutes } from "@/configs/Routes";

const authRoutes: string[] = [
  publicRoutes.login,
  publicRoutes.register,
  publicRoutes.recoverPassword,
  publicRoutes.verifyEmail,
];

export default function Layout({ children }: PropsWithChildren) {
  const router = useRouter();

  if (authRoutes.includes(router.pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <Alert />
      <main className="wrap page-shell">{children}</main>
      <Footer />
    </>
  );
}
