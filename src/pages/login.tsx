import { useState, type FormEvent } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import BrandLink from "@/components/common/BrandLink";
import { adminRoutes, patientRoutes, publicRoutes } from "@/configs/Routes";
import { useAuth } from "@/hooks/useAuth";

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
