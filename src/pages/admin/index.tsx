import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Pagination from "@/components/search/Pagination";
import { publicRoutes } from "@/configs/Routes";
import avaliacoesMock from "@/configs/Avaliacoes";
import minhasAvaliacoesMock from "@/configs/MinhasAvaliacoes";
import unidadesDestaque from "@/configs/UnidadesDestaque";
import usuariosMock from "@/configs/Usuarios";
import { alertService } from "@/services/AlertService";
import type {
  AdminUsuario,
  AdminUsuarioStatus,
  Unidade,
  UserRole,
} from "@/types/Entities";

const PAGE_SIZE = 3;

const roleLabels: Record<Exclude<UserRole, "visitor">, string> = {
  common: "Common",
  functional: "Functional",
  admin: "Admin",
};

const statusLabels: Record<AdminUsuarioStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

export default function AdminPage() {
  const [units, setUnits] = useState<Unidade[]>(unidadesDestaque);
  const [pendingPage, setPendingPage] = useState(1);

  const [usuarios, setUsuarios] = useState<AdminUsuario[]>(usuariosMock);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);

  const pendentes = useMemo(
    () => units.filter((unidade) => unidade.approval === "pendente"),
    [units],
  );

  const filteredUsuarios = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) {
      return usuarios;
    }
    return usuarios.filter((usuario) =>
      `${usuario.name} ${usuario.email} ${roleLabels[usuario.role]}`
        .toLowerCase()
        .includes(term),
    );
  }, [usuarios, userSearch]);

  const pendingStart = (pendingPage - 1) * PAGE_SIZE;
  const pendingItems = pendentes.slice(pendingStart, pendingStart + PAGE_SIZE);

  const userStart = (userPage - 1) * PAGE_SIZE;
  const userItems = filteredUsuarios.slice(userStart, userStart + PAGE_SIZE);

  const avaliacoesRecentes =
    avaliacoesMock.length + minhasAvaliacoesMock.length;

  function handleApprove(id: string) {
    setUnits((current) =>
      current.map((unidade) =>
        unidade.id === id
          ? { ...unidade, approval: "aprovado", status: "publicado" }
          : unidade,
      ),
    );
    alertService.success("Unidade aprovada.");
  }

  function handleReject(id: string) {
    setUnits((current) =>
      current.map((unidade) =>
        unidade.id === id ? { ...unidade, approval: "rejeitado" } : unidade,
      ),
    );
    alertService.error("Unidade rejeitada.");
  }

  function handleToggleUserStatus(id: string) {
    setUsuarios((current) =>
      current.map((usuario) => {
        if (usuario.id !== id) {
          return usuario;
        }
        const nextStatus: AdminUsuarioStatus =
          usuario.status === "ativo" ? "inativo" : "ativo";
        alertService.success(
          nextStatus === "inativo"
            ? "Usuário desativado."
            : "Usuário reativado.",
        );
        return { ...usuario, status: nextStatus };
      }),
    );
  }

  function handlePlaceholderAction() {
    alertService.info("Em desenvolvimento.");
  }

  return (
    <>
      <Head>
        <title>Web Saúde — Painel admin</title>
      </Head>
      <div className="admin">
        <aside className="card side-nav">
          <a href="#dash" className="is-active">
            Dashboard
          </a>
          <a href="#pendentes">Aprovar unidades</a>
          <a href="#usuarios">Gerenciar usuários</a>
        </aside>
        <div>
          <div className="kpis" id="dash">
            <article className="card kpi">
              <span>Total de unidades</span>
              <b>{unidadesDestaque.length}</b>
            </article>
            <article className="card kpi">
              <span>Total de usuários</span>
              <b>{usuariosMock.length}</b>
            </article>
            <article className="card kpi">
              <span>Unidades pendentes</span>
              <b>{pendentes.length}</b>
            </article>
            <article className="card kpi">
              <span>Avaliações recentes</span>
              <b>{avaliacoesRecentes}</b>
            </article>
          </div>

          <section id="pendentes" className="admin-section">
            <h2 className="section-title">Pendentes de aprovação</h2>
            <div className="card table-wrap">
              {pendentes.length === 0 ? (
                <p className="center-note">
                  Nenhuma unidade pendente de aprovação.
                </p>
              ) : (
                <>
                  {pendingItems.map((unidade) => (
                    <div className="admin-table-row" key={unidade.id}>
                      <div>
                        <b>{unidade.name}</b>
                      </div>
                      <div>Gestor</div>
                      <div>10/10/2023</div>
                      <div className="row-actions">
                        <button
                          type="button"
                          onClick={() => handleApprove(unidade.id)}
                        >
                          Aprovar
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleReject(unidade.id)}
                        >
                          Rejeitar
                        </button>
                        <Link href={publicRoutes.unitDetails(unidade.id)}>
                          Ver detalhes
                        </Link>
                      </div>
                    </div>
                  ))}
                  <Pagination
                    page={pendingPage}
                    total={pendentes.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPendingPage}
                  />
                </>
              )}
            </div>
          </section>

          <section id="usuarios" className="admin-section">
            <div className="toolbar">
              <h2 className="section-title toolbar-title">Usuários</h2>
              <input
                className="input toolbar-search"
                placeholder="Buscar usuários..."
                value={userSearch}
                onChange={(event) => {
                  setUserSearch(event.target.value);
                  setUserPage(1);
                }}
              />
            </div>
            <div className="card table-wrap">
              {filteredUsuarios.length === 0 ? (
                <p className="center-note">Nenhum usuário encontrado.</p>
              ) : (
                <>
                  {userItems.map((usuario) => (
                    <div className="admin-user-row" key={usuario.id}>
                      <div>
                        <b>{usuario.name}</b>
                      </div>
                      <div>{usuario.email}</div>
                      <div>
                        <span className="chip">{roleLabels[usuario.role]}</span>
                      </div>
                      <div>
                        <span
                          className={`chip ${usuario.status === "ativo" ? "chip-ok" : "chip-muted"}`}
                        >
                          {statusLabels[usuario.status]}
                        </span>
                      </div>
                      <div className="row-actions">
                        <button type="button" onClick={handlePlaceholderAction}>
                          Ver
                        </button>
                        <button type="button" onClick={handlePlaceholderAction}>
                          Editar
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleToggleUserStatus(usuario.id)}
                        >
                          {usuario.status === "ativo" ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Pagination
                    page={userPage}
                    total={filteredUsuarios.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setUserPage}
                  />
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
