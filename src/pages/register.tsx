import { useState, type FormEvent } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import BrandLink from "@/components/common/BrandLink";
import { publicRoutes } from "@/configs/Routes";

type TipoConta = "paciente" | "gestor";

export default function RegistroPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoConta>("paciente");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (senha !== confirmaSenha) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    setPasswordError(null);
    router.push(
      `${publicRoutes.verifyEmail}?email=${encodeURIComponent(email)}&tipo=${tipo}`,
    );
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
              >
                Sou Paciente
              </button>
              <button
                type="button"
                className={tipo === "gestor" ? "is-on" : undefined}
                onClick={() => setTipo("gestor")}
              >
                Sou Gestor de Unidade
              </button>
            </div>
            <label className="field">
              <span>Nome</span>
              <input
                className="input"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
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
              />
            </label>
            <label className="field">
              <span>Telefone</span>
              <input
                className="input"
                placeholder="(11) 98765-4321"
                value={telefone}
                onChange={(event) => setTelefone(event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Senha</span>
              <input
                className="input"
                type="password"
                minLength={6}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Confirmar senha</span>
              <input
                className="input"
                type="password"
                value={confirmaSenha}
                onChange={(event) => setConfirmaSenha(event.target.value)}
                required
              />
            </label>
            {passwordError ? (
              <p className="field-error">{passwordError}</p>
            ) : null}
            <label className="check">
              <input type="checkbox" required /> Aceito os Termos de uso e a
              Política de privacidade
            </label>
            <button className="btn btn-primary btn-lg" type="submit">
              Criar conta
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
