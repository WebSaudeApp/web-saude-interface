import type { PropsWithChildren } from "react";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import Alert from "@/components/common/Alert";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <Alert />
      <main className="wrap page-shell">{children}</main>
      <Footer />
    </>
  );
}
