import { useState, type FormEvent } from "react";
import Head from "next/head";
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
import { AuthService } from "@/services/AuthService";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const session = await AuthService.login({
        email: email.trim(),
        senha: password,
      });

      signIn(session);

      if (session.user.role === "admin") {
        router.push(adminRoutes.dashboard);
      } else if (session.user.role === "functional") {
        router.push(managerRoutes.units);
      } else {
        router.push(patientRoutes.profile);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Erro ao realizar login. Verifique seus dados.");
      } else {
        setError("Erro ao realizar login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
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

            {error ? (
              <div
                role="alert"
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            ) : null}

            <label className="field">
              <span>E-mail</span>
              <input
                className="input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading}
              />
            </label>
            <label className="field">
              <span>Senha</span>
              <input
                className="input"
                type="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isLoading}
              />
            </label>
            <div className="auth-row">
              <label className="check">
                <input type="checkbox" /> Lembrar-me
              </label>
              <Link href={publicRoutes.recoverPassword}>Esqueceu a senha?</Link>
            </div>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
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
