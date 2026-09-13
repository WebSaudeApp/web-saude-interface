import { unidadeDetailSections } from "@/configs/DisplayFields";
import type { Unidade } from "@/types/Entities";

type UnidadeDetailsProps = {
  unidade: Unidade;
};

export default function UnidadeDetails({ unidade }: UnidadeDetailsProps) {
  return (
    <article>
      <h1>{unidade.name}</h1>
      <p>{unidade.description}</p>
      <ul>
        {unidadeDetailSections.map((section) => (
          <li key={section}>{section}</li>
        ))}
      </ul>
    </article>
  );
}
