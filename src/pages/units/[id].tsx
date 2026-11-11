import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import UnidadeDetails from "@/components/details/UnidadeDetails";
import { useUnidade } from "@/hooks/useUnidades";
import { ApiError } from "@/services/ApiClient";

export default function UnidadeDetalhePage() {
  const router = useRouter();
  const id = String(router.query.id ?? "");
  const {
    data: unidade,
    error,
    isLoading,
    mutate,
  } = useUnidade(id || undefined);

  if (isLoading || (!unidade && !error && id)) {
    return (
      <div className="details" id="detalhe">
        <p className="center-note details-loading">
          Carregando informações da unidade...
        </p>
      </div>
    );
  }

  if (!unidade) {
    // Only what the API has is shown: an unknown id is "not found", never a
    // stand-in unit.
    const isNotFound =
      !error || (error instanceof ApiError && error.status === 404);

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
              <div className="notfound-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void mutate()}
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

  return (
    <>
      <Head>
        <title>{`Web Saúde — ${unidade.name}`}</title>
      </Head>
      <div className="details" id="detalhe">
        <UnidadeDetails key={unidade.id} unidade={unidade} />
      </div>
    </>
  );
}

// Forces per-request rendering so router.query already has `id` on the
// first paint instead of only after client hydration.
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
