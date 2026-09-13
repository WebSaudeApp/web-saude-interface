import { useRouter } from "next/router";
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function EditarUnidadePage() {
  const router = useRouter();
  const id = String(router.query.id ?? "");

  return (
    <PagePlaceholder
      title="Editar unidade"
      description={`Formulário de edição da unidade ${id}.`}
    />
  );
}
