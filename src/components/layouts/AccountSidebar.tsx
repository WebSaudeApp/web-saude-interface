import Link from "next/link";
import { useRouter } from "next/router";
import { patientRoutes, publicRoutes } from "@/configs/Routes";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/initials";
import type { UserRole } from "@/types/Entities";

const roleLabels: Record<Exclude<UserRole, "visitor">, string> = {
  common: "Paciente",
  functional: "Gestor de unidade",
  admin: "Administrador",
};

const mockDefaults = {
  name: "Maria Silva",
  email: "maria@email.com",
};

export default function AccountSidebar() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const name = user?.name ?? mockDefaults.name;
  const email = user?.email ?? mockDefaults.email;
  const tipoLabel = roleLabels[user?.role ?? "common"];

  function handleSignOut() {
    signOut();
    router.push(publicRoutes.home);
  }

  return (
    <aside className="card side">
      <div className="avatar avatar-initials" aria-hidden="true">
        {getInitials(name)}
      </div>
      <b>{name}</b>
      <div className="help">{email}</div>
      <span className="chip">{tipoLabel}</span>
      <nav className="side-nav">
        <Link
          className={
            router.pathname === patientRoutes.profile ? "is-active" : undefined
          }
          href={patientRoutes.profile}
        >
          Editar perfil
        </Link>
        <Link
          className={
            router.pathname === patientRoutes.favorites
              ? "is-active"
              : undefined
          }
          href={patientRoutes.favorites}
        >
          Meus favoritos
        </Link>
        <Link
          className={
            router.pathname === patientRoutes.reviews ? "is-active" : undefined
          }
          href={patientRoutes.reviews}
        >
          Minhas avaliações
        </Link>
        <Link href={`${publicRoutes.recoverPassword}?flow=change`}>
          Alterar senha
        </Link>
        <button type="button" onClick={handleSignOut}>
          Sair
        </button>
      </nav>
    </aside>
  );
}
