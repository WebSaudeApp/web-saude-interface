import { useRouter } from "next/router";
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function UnidadeDetalhePage() {
  const router = useRouter();
  const id = String(router.query.id ?? "");

  return (
    <PagePlaceholder
      title="Detalhes da unidade"
      description={`Página de detalhe para a unidade ${id}.`}
    />
  );
}
