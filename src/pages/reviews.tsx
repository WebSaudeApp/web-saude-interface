import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import AccountSidebar from "@/components/layouts/AccountSidebar";
import Pagination from "@/components/search/Pagination";
import { publicRoutes } from "@/configs/Routes";
import minhasAvaliacoesMock from "@/configs/MinhasAvaliacoes";
import unidadesDestaque from "@/configs/UnidadesDestaque";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/stars";

const PAGE_SIZE = 3;

export default function AvaliacoesPage() {
  const [page, setPage] = useState(1);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = minhasAvaliacoesMock.slice(start, start + PAGE_SIZE);

  return (
    <>
      <Head>
        <title>Web Saúde — Minhas avaliações</title>
      </Head>
      <div className="account">
        <AccountSidebar />
        <section>
          <h1 className="section-title">Minhas avaliações</h1>
          {minhasAvaliacoesMock.length === 0 ? (
            <p className="center-note">Você ainda não fez nenhuma avaliação.</p>
          ) : (
            <div className="list">
              {pageItems.map((avaliacao) => {
                const unidade = unidadesDestaque.find(
                  (item) => item.id === avaliacao.unidadeId,
                );

                return (
                  <article className="card info-card" key={avaliacao.id}>
                    <b>{unidade?.name ?? "Unidade não encontrada"}</b>
                    <div>
                      {formatStars(avaliacao.rating)} ·{" "}
                      {formatDate(avaliacao.createdAt)}
                    </div>
                    <p>{avaliacao.comment}</p>
                    {unidade ? (
                      <Link href={publicRoutes.unitDetails(unidade.id)}>
                        Ver unidade
                      </Link>
                    ) : null}
                  </article>
                );
              })}
              <Pagination
                page={page}
                total={minhasAvaliacoesMock.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
