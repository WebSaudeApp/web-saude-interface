import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { publicRoutes } from "@/configs/Routes";
import cidades from "@/configs/Cidades";

type ResultsSearchDockProps = {
  initialTerm: string;
  initialCidade: string;
};

export default function ResultsSearchDock({
  initialTerm,
  initialCidade,
}: ResultsSearchDockProps) {
  const router = useRouter();
  const [term, setTerm] = useState(initialTerm);
  const [cidade, setCidade] = useState(initialCidade);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void router.push({
      pathname: publicRoutes.search,
      query: { q: term, cidade },
    });
  }

  return (
    <form className="search-dock" onSubmit={handleSubmit}>
      <input
        className="input"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Hospital, clínica ou especialidade"
      />
      <select
        className="select"
        value={cidade}
        onChange={(event) => setCidade(event.target.value)}
      >
        {cidades.map((c) => (
          <option key={c.nome} value={c.nome}>
            {c.nome} ({c.uf})
          </option>
        ))}
      </select>
      <button className="btn btn-primary" type="submit">
        Buscar
      </button>
    </form>
  );
}
