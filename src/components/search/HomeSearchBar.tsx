import { FormEvent } from "react";
import { useRouter } from "next/router";
import { publicRoutes } from "@/configs/Routes";

export default function HomeSearchBar() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const term = String(form.get("term") ?? "");
    const type = String(form.get("type") ?? "");
    const specialty = String(form.get("specialty") ?? "");
    void router.push({
      pathname: publicRoutes.search,
      query: { term, type, specialty },
    });
  }

  return (
    <form className="card search-bar" onSubmit={handleSubmit}>
      <label className="input-icon">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
        <input
          className="input"
          name="term"
          placeholder="Hospital, clínica ou especialidade"
        />
      </label>
      <select className="select" name="type" defaultValue="">
        <option value="">Tipo</option>
        <option value="hospital">Hospital</option>
        <option value="clinica">Clínica</option>
        <option value="pronto_atendimento">Pronto atendimento</option>
      </select>
      <select className="select" name="specialty" defaultValue="">
        <option value="">Especialidade</option>
        <option value="Cardiologia">Cardiologia</option>
        <option value="Ortopedia">Ortopedia</option>
        <option value="Pediatria">Pediatria</option>
        <option value="Clínica Geral">Clínica Geral</option>
      </select>
      <button className="btn btn-primary" type="submit">
        Buscar
      </button>
    </form>
  );
}
