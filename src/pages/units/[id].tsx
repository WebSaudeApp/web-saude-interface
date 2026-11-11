import { useMemo } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import UnidadeDetails from "@/components/details/UnidadeDetails";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import { useUnidade } from "@/hooks/useUnidades";
import { fromApiEstabelecimento } from "@/lib/estabelecimentoAdapter";
import { lookupUnit } from "@/lib/unitServer";
import { ApiError } from "@/services/ApiClient";
import type { ApiEstabelecimento } from "@/types/Api";
import type { Unidade } from "@/types/Entities";

type UnidadeDetalhePageProps = {
  // The unit as the server got it from the API; null when it could not (the
  // browser then asks for it).
  initialUnit: ApiEstabelecimento | null;
  // The API said this unit does not exist.
  unitNotFound: boolean;
  // Where the site is served, for the absolute address of the preview image.
  origin: string;
};

// What a chat app or social network shows when the link is shared. They read
// the HTML and do not run scripts, so it has to be in the server's response.
function unitDescription(unidade: Unidade) {
  const type = unidadeTypeLabels[unidade.type] ?? unidade.type;
  const place = [unidade.address.city, unidade.address.state]
    .filter(Boolean)
    .join(" – ");
  const specialties = unidade.specialties.slice(0, 3).join(", ");
  return [
    place ? `${type} em ${place}.` : `${type}.`,
    specialties ? `${specialties}.` : "",
    "Endereço, horários e contatos no Web Saúde.",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function UnidadeDetalhePage({
  initialUnit,
  unitNotFound,
  origin,
}: UnidadeDetalhePageProps) {
  const router = useRouter();
  const id = String(router.query.id ?? "");
  // Adapted here, in the browser too, so "open now" uses the visitor's clock.
  const initial = useMemo(
    () => (initialUnit ? fromApiEstabelecimento(initialUnit) : undefined),
    [initialUnit],
  );
  const {
    data: unidade,
    error,
    isLoading,
    mutate,
  } = useUnidade(unitNotFound ? undefined : id || undefined, initial);

  if (isLoading || (!unidade && !error && !unitNotFound && id)) {
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
      unitNotFound ||
      !error ||
      (error instanceof ApiError && error.status === 404);

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

  const title = `Web Saúde — ${unidade.name}`;
  const description = unitDescription(unidade);
  const image = unidade.photos[0] && origin ? origin + unidade.photos[0] : "";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Web Saúde" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {image && <meta property="og:image" content={image} />}
      </Head>
      <div className="details" id="detalhe">
        <UnidadeDetails key={unidade.id} unidade={unidade} />
      </div>
    </>
  );
}

// The unit comes from the server so the HTML already has the title and the
// preview tags, and an unknown id answers 404. If the API is slow or down the
// page still opens and the browser fetches the unit.
export const getServerSideProps: GetServerSideProps<
  UnidadeDetalhePageProps
> = async ({ params, req, res }) => {
  const lookup = await lookupUnit(String(params?.id ?? ""));
  if (lookup.status === "notfound") {
    res.statusCode = 404;
  }

  const forwardedHost = req.headers["x-forwarded-host"];
  const host =
    typeof forwardedHost === "string" ? forwardedHost : req.headers.host;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    typeof forwardedProto === "string" ? forwardedProto.split(",")[0] : "http";

  return {
    props: {
      initialUnit: lookup.status === "ok" ? lookup.unit : null,
      unitNotFound: lookup.status === "notfound",
      origin: host ? `${proto}://${host}` : "",
    },
  };
};
