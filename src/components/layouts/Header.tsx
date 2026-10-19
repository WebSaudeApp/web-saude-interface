import Link from "next/link";
import { useRouter } from "next/router";
import BrandLink from "@/components/common/BrandLink";
import {
  adminRoutes,
  managerRoutes,
  patientRoutes,
  publicRoutes,
} from "@/configs/Routes";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: publicRoutes.home, label: "Início" },
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
        <BrandLink />
        <nav className="nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActivePath(router.pathname, link.href)
                  ? "is-active"
                  : undefined
              }
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
