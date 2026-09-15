import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Pagination from "@/components/search/Pagination";
import { managerRoutes, publicRoutes } from "@/configs/Routes";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import unidadesDestaque from "@/configs/UnidadesDestaque";
import { alertService } from "@/services/AlertService";
import type { AprovacaoStatus, Unidade, UnidadeStatus } from "@/types/Entities";

const PAGE_SIZE = 3;

const statusLabels: Record<UnidadeStatus, string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
};

const statusChipClass: Record<UnidadeStatus, string> = {
  publicado: "chip-ok",
  rascunho: "chip-muted",
};

const approvalLabels: Record<AprovacaoStatus, string> = {
  aprovado: "Aprovado",
  pendente: "Pendente",
  rejeitado: "Rejeitado",
};

const approvalChipClass: Record<AprovacaoStatus, string> = {
  aprovado: "chip-ok",
  pendente: "chip-warn",
  rejeitado: "chip-muted",
};

export default function GestorUnidadesPage() {
  const [units, setUnits] = useState<Unidade[]>(unidadesDestaque);
  const [statusFilter, setStatusFilter] = useState<UnidadeStatus | "">("");
  const [approvalFilter, setApprovalFilter] = useState<AprovacaoStatus | "">(
    "",
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return units.filter((unidade) => {
      const statusOk = !statusFilter || unidade.status === statusFilter;
      const approvalOk = !approvalFilter || unidade.approval === approvalFilter;
      const termOk = !term || unidade.name.toLowerCase().includes(term);
      return statusOk && approvalOk && termOk;
    });
  }, [units, statusFilter, approvalFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, approvalFilter, search]);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  function handleDelete(id: string) {
    setUnits((current) => current.filter((unidade) => unidade.id !== id));
    alertService.success("Unidade excluída.");
  }

  return (
    <>
      <Head>
        <title>Web Saúde — Minhas unidades</title>
      </Head>
      <div className="toolbar">
        <h1>Minhas unidades</h1>
        <Link className="btn btn-primary" href={managerRoutes.newUnit}>
          Adicionar nova unidade
        </Link>
      </div>
      <div className="toolbar toolbar-filters">
        <select
          className="select"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as UnidadeStatus | "")
          }
        >
          <option value="">Todos os status</option>
          <option value="publicado">Publicado</option>
          <option value="rascunho">Rascunho</option>
        </select>
        <select
          className="select"
          value={approvalFilter}
          onChange={(event) =>
            setApprovalFilter(event.target.value as AprovacaoStatus | "")
          }
        >
          <option value="">Todas as aprovações</option>
          <option value="aprovado">Aprovado</option>
          <option value="pendente">Pendente</option>
          <option value="rejeitado">Rejeitado</option>
        </select>
        <input
          className="input"
          placeholder="Buscar unidade"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="card table-wrap">
        {filtered.length === 0 ? (
          <p className="center-note">Nenhuma unidade encontrada.</p>
        ) : (
          <>
            <div className="unit-table-row unit-table-head">
              <div>Nome</div>
              <div>Tipo</div>
              <div>Status</div>
              <div>Aprovação</div>
              <div>Ações</div>
            </div>
            {pageItems.map((unidade) => (
              <div className="unit-table-row" key={unidade.id}>
                <div>
                  <b>{unidade.name}</b>
                </div>
                <div>{unidadeTypeLabels[unidade.type]}</div>
                <div>
                  <span className={`chip ${statusChipClass[unidade.status]}`}>
                    {statusLabels[unidade.status]}
                  </span>
                </div>
                <div>
                  <span
                    className={`chip ${approvalChipClass[unidade.approval]}`}
                  >
                    {approvalLabels[unidade.approval]}
                  </span>
                </div>
                <div className="row-actions">
                  <Link href={managerRoutes.editUnit(unidade.id)}>Editar</Link>
                  <Link href={publicRoutes.unitDetails(unidade.id)}>Ver</Link>
                  <button
                    className="danger"
                    type="button"
                    onClick={() => handleDelete(unidade.id)}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
            <Pagination
              page={page}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}
