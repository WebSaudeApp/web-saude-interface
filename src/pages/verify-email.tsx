import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import BrandLink from "@/components/common/BrandLink";
import { managerRoutes, patientRoutes } from "@/configs/Routes";

const CODE_LENGTH = 6;
const EXPIRATION_SECONDS = 10 * 60;
const RESEND_MESSAGE_MS = 3000;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function VerificarEmailPage() {
  const router = useRouter();
  const email =
    typeof router.query.email === "string" ? router.query.email : "";
  const tipo =
    typeof router.query.tipo === "string" ? router.query.tipo : "paciente";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(EXPIRATION_SECONDS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!resendMessage) {
      return;
    }
    const timeout = setTimeout(() => setResendMessage(null), RESEND_MESSAGE_MS);
    return () => clearTimeout(timeout);
  }, [resendMessage]);

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (secondsLeft === 0) {
      setError("Código expirado. Solicite um novo código.");
      return;
    }

    if (digits.some((digit) => !digit)) {
      setError("Digite o código completo.");
      return;
    }

    setError(null);
    router.push(
      tipo === "gestor" ? managerRoutes.units : patientRoutes.profile,
    );
  }

  function handleResend() {
    setSecondsLeft(EXPIRATION_SECONDS);
    setDigits(Array(CODE_LENGTH).fill(""));
    setError(null);
    inputsRef.current[0]?.focus();
    setResendMessage("Novo código enviado.");
  }

  return (
    <>
      <Head>
        <title>Web Saúde — Verificar e-mail</title>
      </Head>
      <div className="auth-page">
        <form className="card auth-card auth-card-solo" onSubmit={handleSubmit}>
          <BrandLink />
          <h1>Verifique seu e-mail</h1>
          <p className="sub">
            {email
              ? `Enviamos um código de 6 dígitos para ${email}.`
              : "Enviamos um código de 6 dígitos. Digite o código para confirmar sua conta."}
          </p>
          <div className="otp">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                maxLength={1}
                inputMode="numeric"
                value={digit}
                onChange={(event) =>
                  handleDigitChange(index, event.target.value)
                }
                onKeyDown={(event) => handleKeyDown(index, event)}
              />
            ))}
          </div>
          {error ? <p className="field-error">{error}</p> : null}
          <button className="btn btn-primary btn-lg" type="submit">
            Verificar
          </button>
          <p className="center-note">
            <button type="button" onClick={handleResend}>
              Reenviar código
            </button>
          </p>
          {resendMessage ? (
            <p className="field-success">{resendMessage}</p>
          ) : (
            <p className="center-note">
              {secondsLeft > 0
                ? `O código expira em ${formatTime(secondsLeft)}`
                : "O código expirou."}
            </p>
          )}
        </form>
      </div>
    </>
  );
}

// Forces per-request rendering so router.query already has `email`/`tipo` on
// the first paint instead of only after client hydration.
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
