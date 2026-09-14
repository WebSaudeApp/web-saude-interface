import Head from "next/head";
import CitySearchCard from "@/components/search/CitySearchCard";

const steps = [
  {
    title: "Escolha sua cidade",
    description: "Use a busca ou permita sua localização.",
  },
  {
    title: "Compare unidades",
    description: "Veja avaliações, horários e convênios.",
  },
  {
    title: "Cuide de você",
    description: "Escolha a melhor opção para o momento.",
  },
];

export default function CidadePage() {
  return (
    <>
      <Head>
        <title>Web Saúde — Escolha sua cidade</title>
      </Head>
      <section className="city-hero">
        <div>
          <span className="badge">Cuidado perto de você</span>
          <h1>Encontre saúde de qualidade, onde você estiver.</h1>
          <p>
            Hospitais, clínicas e pronto-atendimentos confiáveis, organizados
            pela cidade que você escolher.
          </p>
          <div className="benefits">
            <span>✓ Unidades verificadas</span>
            <span>✓ Busca personalizada</span>
            <span>✓ Informação clara</span>
          </div>
        </div>
        <CitySearchCard />
      </section>
      <section className="steps">
        <h2>Seu cuidado começa com uma escolha simples</h2>
        <div className="step-grid">
          {steps.map((step, index) => (
            <article className="card step" key={step.title}>
              <span>{index + 1}</span>
              <b>{step.title}</b>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
