import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import UnidadeDetails from "@/components/details/UnidadeDetails";
import unidadesDestaque from "@/configs/UnidadesDestaque";
import { useUnidade } from "@/hooks/useUnidades";
import { ApiError } from "@/services/ApiClient";

export default function UnidadeDetalhePage() {
  const router = useRouter();
  const id = String(router.query.id ?? "");
  const { data: apiUnidade, error, isLoading } = useUnidade(id || undefined);

  // If the API returns 404, check if it exists in mock data as a fallback.
  const fallbackUnidade =
    error && (error as ApiError).status === 404
      ? unidadesDestaque.find((item) => item.id === id)
      : undefined;

  const unidade = apiUnidade ?? fallbackUnidade;

  if (isLoading || (!unidade && !error && id)) {
    return (
      <div className="details" id="detalhe">
        <p
          className="center-note"
          style={{ textAlign: "center", padding: "48px 0" }}
        >
          Carregando informações da unidade...
        </p>
      </div>
    );
  }

  if (error && !unidade) {
    const isNotFound = (error as ApiError).status === 404;

    return (
      <>
        <Head>
          <title>
            {isNotFound
              ? "Web Saúde — Unidade não encontrada"
              : "Web Saúde — Serviço indisponível"}
          </title>
        </Head>
        <div className="details" id="detalhe">
          <section className="card notfound">
            <h1>
              {isNotFound
                ? "Unidade não encontrada"
                : "Serviço temporariamente indisponível"}
            </h1>
            <p className="center-note">
              {isNotFound
                ? "Não encontramos a unidade que você procurou. Ela pode ter sido removida ou o link está incorreto."
                : "Não foi possível carregar as informações da unidade no momento. Por favor, tente novamente em instantes."}
            </p>
            {isNotFound ? (
              <Link className="btn btn-primary" href="/">
                Voltar para a busca
              </Link>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Tentar novamente
                </button>
                <Link className="btn btn-ghost" href="/">
                  Voltar para a busca
                </Link>
              </div>
            )}
          </section>
        </div>
      </>
    );
  }

  if (!unidade) {
    return (
      <>
        <Head>
          <title>Web Saúde — Unidade não encontrada</title>
        </Head>
        <div className="details" id="detalhe">
          <section className="card notfound">
            <h1>Unidade não encontrada</h1>
            <p className="center-note">
              Não encontramos a unidade que você procurou. Ela pode ter sido
              removida ou o link está incorreto.
            </p>
            <Link className="btn btn-primary" href="/">
              Voltar para a busca
            </Link>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`Web Saúde — ${unidade.name}`}</title>
      </Head>
      <div className="details" id="detalhe">
        <UnidadeDetails unidade={unidade} />
      </div>
    </>
  );
}

// Forces per-request rendering so router.query already has `id` on the
// first paint instead of only after client hydration.
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
