import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import UnidadeDetails from "@/components/details/UnidadeDetails";
import unidadesDestaque from "@/configs/UnidadesDestaque";

export default function UnidadeDetalhePage() {
  const router = useRouter();
  const id = String(router.query.id ?? "");
  const unidade = unidadesDestaque.find((item) => item.id === id);

  if (!unidade) {
    return (
      <section>
        <h1>Unidade não encontrada</h1>
        <p className="help">
          Verifique o link acessado ou volte para a busca de unidades.
        </p>
      </section>
    );
  }

  return (
    <>
      <Head>
        <title>{`Web Saúde — ${unidade.name}`}</title>
      </Head>
      <UnidadeDetails unidade={unidade} />
    </>
  );
}

// Forces per-request rendering so router.query already has `id` on the
// first paint instead of only after client hydration.
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
