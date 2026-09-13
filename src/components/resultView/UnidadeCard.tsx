import Link from "next/link";
import { publicRoutes } from "@/configs/Routes";
import type { Unidade } from "@/types/Entities";

type UnidadeCardProps = {
  unidade: Unidade;
};

export default function UnidadeCard({ unidade }: UnidadeCardProps) {
  return (
    <article className="card">
      <h2>{unidade.name}</h2>
      <p>{unidade.type}</p>
      <p>
        {unidade.address.city} / {unidade.address.state}
      </p>
      <Link href={publicRoutes.unitDetails(unidade.id)}>Ver detalhes</Link>
    </article>
  );
}
