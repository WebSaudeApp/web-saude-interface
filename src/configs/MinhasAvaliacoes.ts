import type { MinhaAvaliacao } from "@/types/Entities";

const minhasAvaliacoesMock: MinhaAvaliacao[] = [
  {
    id: "1",
    unidadeId: "1",
    rating: 5,
    comment: "Atendimento rápido e equipe muito atenciosa.",
    createdAt: "2023-10-10",
  },
  {
    id: "2",
    unidadeId: "2",
    rating: 4,
    comment: "Bom atendimento, mas a espera foi um pouco longa.",
    createdAt: "2023-09-22",
  },
  {
    id: "3",
    unidadeId: "3",
    rating: 5,
    comment: "Fui muito bem atendida na emergência, recomendo.",
    createdAt: "2023-08-15",
  },
  {
    id: "4",
    unidadeId: "4",
    rating: 5,
    comment: "Estrutura excelente e médicos muito capacitados.",
    createdAt: "2023-07-30",
  },
  {
    id: "5",
    unidadeId: "5",
    rating: 4,
    comment: "Consulta tranquila, ambiente agradável.",
    createdAt: "2023-06-18",
  },
  {
    id: "6",
    unidadeId: "6",
    rating: 5,
    comment: "Equipe atenciosa do início ao fim.",
    createdAt: "2023-05-02",
  },
];

export default minhasAvaliacoesMock;
