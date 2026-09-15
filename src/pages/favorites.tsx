import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import AccountSidebar from "@/components/layouts/AccountSidebar";
import UnidadeRow from "@/components/resultView/UnidadeRow";
import Pagination from "@/components/search/Pagination";
import unidadesDestaque from "@/configs/UnidadesDestaque";
import { useFavoriteIds } from "@/hooks/useFavorite";

const PAGE_SIZE = 3;

export default function FavoritosPage() {
  const { ids, remove } = useFavoriteIds();
  const [page, setPage] = useState(1);

  const favoritos = useMemo(
    () => unidadesDestaque.filter((unidade) => ids.includes(unidade.id)),
    [ids],
  );

  const totalPages = Math.max(1, Math.ceil(favoritos.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = favoritos.slice(start, start + PAGE_SIZE);

  return (
    <>
      <Head>
        <title>Web Saúde — Meus favoritos</title>
      </Head>
      <div className="account">
        <AccountSidebar />
        <section>
          <h1 className="section-title">Meus favoritos</h1>
          {favoritos.length === 0 ? (
            <p className="center-note">Você não tem favoritos.</p>
          ) : (
            <div className="list">
              <p className="help">{favoritos.length} unidades salvas</p>
              {pageItems.map((unidade) => (
                <UnidadeRow
                  key={unidade.id}
                  unidade={unidade}
                  onFavoriteChange={(isFavorite) => {
                    if (!isFavorite) {
                      remove(unidade.id);
                    }
                  }}
                />
              ))}
              <Pagination
                page={page}
                total={favoritos.length}
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
