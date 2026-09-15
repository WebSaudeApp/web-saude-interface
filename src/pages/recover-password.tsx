import { useState, type FormEvent } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import BrandLink from "@/components/common/BrandLink";
import { publicRoutes } from "@/configs/Routes";

const RESET_REDIRECT_MS = 900;

type Stage = "email" | "confirmation" | "reset" | "success";

const requestCopy: Record<
  "recover" | "change",
  {
    title: string;
    subtitle: string;
    confirmationSubtitle: (email: string) => string;
  }
> = {
  recover: {
    title: "Recuperar senha",
    subtitle:
      "Informe o e-mail da sua conta para enviarmos o link de redefinição.",
    confirmationSubtitle: (email) =>
      `Enviamos um link de redefinição para ${email}. Abra o link recebido para continuar.`,
  },
  change: {
    title: "Alterar senha",
    subtitle: "Informe seu e-mail para confirmarmos a alteração de senha.",
    confirmationSubtitle: (email) =>
      `Enviamos um link de confirmação para ${email}. Abra o link recebido para continuar.`,
  },
};

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const flow = router.query.flow === "change" ? "change" : "recover";

  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stepNumber = stage === "reset" || stage === "success" ? 2 : 1;

  const title =
    stage === "reset" || stage === "success"
      ? "Nova senha"
      : stage === "confirmation"
        ? "Verifique seu e-mail"
        : requestCopy[flow].title;

  const subtitle =
    stage === "reset" || stage === "success"
      ? "Crie uma senha nova para a sua conta."
      : stage === "confirmation"
        ? requestCopy[flow].confirmationSubtitle(email)
        : requestCopy[flow].subtitle;

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStage("confirmation");
  }

  function handleOpenLink() {
    setStage("reset");
  }

  function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (senha !== confirmaSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setError(null);
    setStage("success");
    setTimeout(() => {
      router.push(publicRoutes.login);
    }, RESET_REDIRECT_MS);
  }

  return (
    <>
      <Head>
        <title>{`Web Saúde — ${title}`}</title>
      </Head>
      <div className="auth-page">
        <form
          className="card auth-card auth-card-solo"
          onSubmit={
            stage === "email"
              ? handleEmailSubmit
              : stage === "reset"
                ? handleResetSubmit
                : (event) => event.preventDefault()
          }
        >
          <BrandLink />
          <h1>{title}</h1>
          <p className="sub">{subtitle}</p>

          {stage === "email" ? (
            <>
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
              <button className="btn btn-primary btn-lg" type="submit">
                Enviar
              </button>
            </>
          ) : null}

          {stage === "confirmation" ? (
            <button
              className="btn btn-primary btn-lg"
              type="button"
              onClick={handleOpenLink}
            >
              Abrir link recebido
            </button>
          ) : null}

          {stage === "reset" ? (
            <>
              <label className="field">
                <span>Nova senha</span>
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
              {error ? <p className="field-error">{error}</p> : null}
              <button className="btn btn-primary btn-lg" type="submit">
                Resetar senha
              </button>
            </>
          ) : null}

          {stage === "success" ? (
            <p className="field-success">
              Senha redefinida com sucesso. Redirecionando para o login…
            </p>
          ) : null}

          <p className="center-note">Etapa {stepNumber} de 2</p>
          <p className="center-note">
            <Link href={publicRoutes.login}>Voltar ao login</Link>
          </p>
        </form>
      </div>
    </>
  );
}

// Forces per-request rendering so router.query already has `flow` on the
// first paint instead of only after client hydration.
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
