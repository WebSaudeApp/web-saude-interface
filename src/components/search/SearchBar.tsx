import { FormEvent } from "react";
import { useRouter } from "next/router";
import { publicRoutes } from "@/configs/Routes";

export default function SearchBar() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const term = String(form.get("term") ?? "");
    const city = String(form.get("city") ?? "");
    void router.push({
      pathname: publicRoutes.search,
      query: { term, city },
    });
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <input name="term" placeholder="Hospital, clínica ou especialidade" />
      <input name="city" placeholder="Cidade" />
      <button className="btn" type="submit">
        Buscar
      </button>
    </form>
  );
}
