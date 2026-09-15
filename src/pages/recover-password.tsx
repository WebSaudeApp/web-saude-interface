import { useState, type FormEvent } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import BrandLink from "@/components/common/BrandLink";
import { publicRoutes } from "@/configs/Routes";

const RESET_REDIRECT_MS = 900;

const stepOneCopy: Record<
  "recover" | "change",
  { title: string; subtitle: string }
> = {
  recover: {
    title: "Recuperar senha",
    subtitle:
      "Informe o e-mail da sua conta para enviarmos o link de redefinição.",
  },
  change: {
    title: "Alterar senha",
    subtitle: "Informe seu e-mail para confirmarmos a alteração de senha.",
  },
};

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const flow = router.query.flow === "change" ? "change" : "recover";

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const title = step === 1 ? stepOneCopy[flow].title : "Nova senha";
  const subtitle =
    step === 1
      ? stepOneCopy[flow].subtitle
      : "Crie uma senha nova para a sua conta.";

  function handleStepOneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep(2);
  }

  function handleStepTwoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (senha !== confirmaSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setError(null);
    setSuccess(true);
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
          onSubmit={step === 1 ? handleStepOneSubmit : handleStepTwoSubmit}
        >
          <BrandLink />
          <h1>{title}</h1>
          <p className="sub">{subtitle}</p>

          {success ? (
            <p className="field-success">
              Senha redefinida com sucesso. Redirecionando para o login…
            </p>
          ) : step === 1 ? (
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
          ) : (
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
          )}

          <p className="center-note">Etapa {step} de 2</p>
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
