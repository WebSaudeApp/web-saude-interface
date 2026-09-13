import { useState } from "react";
import Head from "next/head";
import HomeSearchBar from "@/components/search/HomeSearchBar";
import UnidadeCard from "@/components/resultView/UnidadeCard";
import Pagination from "@/components/search/Pagination";
import Unidades from "@/configs/Unidades";
import unidadesDestaque from "@/configs/UnidadesDestaque";

export default function HomePage() {
  const [page, setPage] = useState(1);
  const pageSize = Unidades.config.resultsPerPage;
  const start = (page - 1) * pageSize;
  const items = unidadesDestaque.slice(start, start + pageSize);

  return (
    <>
      <Head>
        <title>Web Saúde</title>
      </Head>
      <section className="hero">
        <h1>Encontre saúde de qualidade, onde você estiver.</h1>
        <p>
          Hospitais, clínicas e pronto-atendimentos confiáveis, organizados pela
          cidade que você escolher.
        </p>
        <HomeSearchBar />
      </section>
      <section>
        <h2 className="section-title">Unidades em destaque</h2>
        <div className="list">
          <div className="unit-grid">
            {items.map((unidade) => (
              <UnidadeCard key={unidade.id} unidade={unidade} />
            ))}
          </div>
          <Pagination
            page={page}
            total={unidadesDestaque.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      </section>
    </>
  );
}
