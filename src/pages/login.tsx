import { useState, type FormEvent } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { adminRoutes, patientRoutes, publicRoutes } from "@/configs/Routes";
import { useAuth } from "@/hooks/useAuth";

function BrandLink() {
  return (
    <Link className="brand" href={publicRoutes.home}>
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
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const isAdmin = email.toLowerCase().includes("admin");
    const name = email.split("@")[0] || "Usuário";

    signIn({
      user: {
        id: "mock-user",
        name,
        email,
        role: isAdmin ? "admin" : "common",
      },
      token: "mock-token",
    });

    router.push(isAdmin ? adminRoutes.dashboard : patientRoutes.profile);
  }

  return (
    <>
      <Head>
        <title>Web Saúde — Entrar</title>
      </Head>
      <div className="auth-page">
        <div className="auth-split">
          <div className="auth-art">
            <BrandLink />
            <h2>Cuidado mais perto de você</h2>
            <div className="illu" aria-hidden="true" />
          </div>
          <form className="card auth-card" onSubmit={handleSubmit}>
            <BrandLink />
            <h1>Entrar na sua conta</h1>
            <p className="sub">Acesse para favoritar e avaliar unidades</p>
            <label className="field">
              <span>E-mail</span>
              <input
                className="input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Senha</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            <div className="auth-row">
              <label className="check">
                <input type="checkbox" /> Lembrar-me
              </label>
              <Link href={publicRoutes.recoverPassword}>Esqueceu a senha?</Link>
            </div>
            <button className="btn btn-primary btn-lg" type="submit">
              Entrar
            </button>
            <p className="center-note">
              Não tem conta?{" "}
              <Link href={publicRoutes.register}>Criar conta</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
