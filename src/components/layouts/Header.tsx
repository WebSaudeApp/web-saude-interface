import Link from "next/link";
import { useRouter } from "next/router";
import { adminRoutes, managerRoutes, patientRoutes, publicRoutes } from "@/configs/Routes";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: publicRoutes.home, label: "Início" },
  { href: publicRoutes.search, label: "Encontrar unidades" },
  { href: publicRoutes.city, label: "Como funciona" },
];

function isActivePath(pathname: string, href: string) {
  if (href === publicRoutes.home) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const router = useRouter();
  const { user, role } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <Link href={publicRoutes.home} className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8 12h8M12 8v8" strokeLinecap="round" />
              <circle cx="15.2" cy="15.2" r="1.1" fill="#fff" stroke="none" />
              <circle cx="18.4" cy="13.2" r="1.1" fill="#fff" stroke="none" />
              <circle cx="16.8" cy="18.2" r="1.1" fill="#fff" stroke="none" />
              <path d="M15.2 15.2l3.2-2M15.2 15.2l1.6 3" />
            </svg>
          </span>
          <span>Web Saúde</span>
        </Link>
        <nav className="nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActivePath(router.pathname, link.href) ? "is-active" : undefined}
            >
              {link.label}
            </Link>
          ))}
          {role === "admin" ? (
            <>
              <span className="chip">Admin</span>
              <Link className="btn btn-ghost" href={adminRoutes.dashboard}>
                Painel
              </Link>
            </>
          ) : role === "functional" ? (
            <Link className="btn btn-ghost" href={managerRoutes.units}>
              {user?.name ?? "Gestor"}
            </Link>
          ) : user ? (
            <Link className="btn btn-ghost" href={patientRoutes.profile}>
              {user.name}
            </Link>
          ) : (
            <>
              <Link className="btn btn-ghost" href={publicRoutes.login}>
                Entrar
              </Link>
              <Link className="btn btn-primary" href={publicRoutes.register}>
                Registrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
