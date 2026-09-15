import type { UnidadeTipo } from "@/types/Entities";

export const unidadeTypeLabels: Record<UnidadeTipo, string> = {
  hospital: "Hospital",
  clinica: "Clínica",
  pronto_atendimento: "Pronto atendimento",
};

export const unidadeCardFields = [
  "name",
  "type",
  "address",
  "rating",
  "reviewCount",
  "photos",
] as const;

export const gestorUnidadeColumns = [
  "name",
  "type",
  "status",
  "approval",
] as const;

export const adminUserColumns = ["name", "email", "role", "status"] as const;
