import { useState, type FormEvent } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { patientRoutes, publicRoutes } from "@/configs/Routes";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/initials";
import { alertService } from "@/services/AlertService";
import type { UserRole } from "@/types/Entities";

const roleLabels: Record<Exclude<UserRole, "visitor">, string> = {
  common: "Paciente",
  functional: "Gestor de unidade",
  admin: "Administrador",
};

const mockDefaults = {
  name: "Maria Silva",
  email: "maria@email.com",
  phone: "(11) 98765-4321",
};

export default function PerfilPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const initialName = user?.name ?? mockDefaults.name;
  const initialEmail = user?.email ?? mockDefaults.email;
  const initialPhone = user?.phone ?? mockDefaults.phone;
  const tipoLabel = roleLabels[user?.role ?? "common"];

  const [nome, setNome] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [telefone, setTelefone] = useState(initialPhone);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alertService.success("Perfil atualizado.");
  }

  function handleCancel() {
    setNome(initialName);
    setEmail(initialEmail);
    setTelefone(initialPhone);
  }

  function handleSignOut() {
    signOut();
    router.push(publicRoutes.home);
  }

  return (
    <>
      <Head>
        <title>Web Saúde — Meu perfil</title>
      </Head>
      <div className="account">
        <aside className="card side">
          <div className="avatar avatar-initials" aria-hidden="true">
            {getInitials(nome)}
          </div>
          <b>{nome}</b>
          <div className="help">{email}</div>
          <span className="chip">{tipoLabel}</span>
          <nav className="side-nav">
            <Link className="is-active" href={patientRoutes.profile}>
              Editar perfil
            </Link>
            <Link href={patientRoutes.favorites}>Meus favoritos</Link>
            <Link href={patientRoutes.reviews}>Minhas avaliações</Link>
            <Link href={publicRoutes.recoverPassword}>Alterar senha</Link>
            <button type="button" onClick={handleSignOut}>
              Sair
            </button>
          </nav>
        </aside>
        <form className="card panel" onSubmit={handleSubmit}>
          <h1>Meus dados</h1>
          <label className="field">
            <span>Nome</span>
            <input
              className="input"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Telefone</span>
            <input
              className="input"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Tipo de usuário</span>
            <input className="input" value={tipoLabel} disabled />
          </label>
          <div className="form-actions">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit">
              Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
