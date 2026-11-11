import { useEffect } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Layout from "@/components/layouts/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { trackSearchOrigin } from "@/lib/searchOrigin";
import "@/styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleStart = (url: string) =>
      trackSearchOrigin(router.pathname, url);
    router.events.on("routeChangeStart", handleStart);
    return () => router.events.off("routeChangeStart", handleStart);
  }, [router]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}
