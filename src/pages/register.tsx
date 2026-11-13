import { useState, type FormEvent } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import BrandLink from "@/components/common/BrandLink";
import { managerRoutes, patientRoutes, publicRoutes } from "@/configs/Routes";
import { useAuth } from "@/hooks/useAuth";
import { AuthService } from "@/services/AuthService";

type TipoConta = "paciente" | "gestor";

export default function RegistroPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [tipo, setTipo] = useState<TipoConta>("paciente");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (senha.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmaSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    const cleanedPhone = telefone.replace(/\D/g, "");
    if (cleanedPhone && cleanedPhone.length < 10) {
      setError("O telefone deve ter pelo menos 10 dígitos (DDD + número).");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const session = await AuthService.register({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        telefone: cleanedPhone || undefined,
        papel: tipo === "gestor" ? "GESTOR" : "PACIENTE",
      });

      signIn(session);

      if (session.user.role === "functional") {
        router.push(managerRoutes.units);
      } else {
        router.push(patientRoutes.profile);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(
          err.message || "Erro ao criar conta. Verifique os dados informados.",
        );
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Web Saúde — Criar conta</title>
      </Head>
      <div className="auth-page">
        <div className="auth-split">
          <div className="auth-art">
            <BrandLink />
            <h2>Comece a cuidar da sua saúde</h2>
            <div className="illu" aria-hidden="true" />
          </div>
          <form className="card auth-card" onSubmit={handleSubmit}>
            <BrandLink />
            <h1>Criar conta</h1>
            <div className="tabs">
              <button
                type="button"
                className={tipo === "paciente" ? "is-on" : undefined}
                onClick={() => setTipo("paciente")}
                disabled={isLoading}
              >
                Sou Paciente
              </button>
              <button
                type="button"
                className={tipo === "gestor" ? "is-on" : undefined}
                onClick={() => setTipo("gestor")}
                disabled={isLoading}
              >
                Sou Gestor de Unidade
              </button>
            </div>

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
              <span>Nome</span>
              <input
                className="input"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
                disabled={isLoading}
              />
            </label>
            <label className="field">
              <span>E-mail</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading}
              />
            </label>
            <label className="field">
              <span>Telefone</span>
              <input
                className="input"
                placeholder="(11) 98765-4321"
                value={telefone}
                onChange={(event) => setTelefone(event.target.value)}
                disabled={isLoading}
              />
            </label>
            <label className="field">
              <span>Senha (mínimo 8 caracteres)</span>
              <input
                className="input"
                type="password"
                minLength={8}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
                disabled={isLoading}
              />
            </label>
            <label className="field">
              <span>Confirmar senha</span>
              <input
                className="input"
                type="password"
                minLength={8}
                value={confirmaSenha}
                onChange={(event) => setConfirmaSenha(event.target.value)}
                required
                disabled={isLoading}
              />
            </label>
            <label className="check">
              <input type="checkbox" required disabled={isLoading} /> Aceito os
              Termos de uso e a Política de privacidade
            </label>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </button>
            <p className="center-note">
              Já tenho conta · <Link href={publicRoutes.login}>Entrar</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
