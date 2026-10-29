import { useEffect, useState } from "react";
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
  // On small screens the text links move into a menu behind the
  // hamburger button; the account buttons stay in the bar.
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const links = navLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className={
        isActivePath(router.pathname, link.href) ? "is-active" : undefined
      }
    >
      {link.label}
    </Link>
  ));

  return (
    <header className="header">
      <div className="header-inner">
        <BrandLink />
        <nav className="nav">
          <span className="nav-links">{links}</span>
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
          <button
            type="button"
            className="nav-toggle"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d={
                  menuOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"
                }
              />
            </svg>
          </button>
        </nav>
      </div>
      {menuOpen && (
        <div className="nav-menu" id="nav-menu">
          {links}
        </div>
      )}
    </header>
  );
}
