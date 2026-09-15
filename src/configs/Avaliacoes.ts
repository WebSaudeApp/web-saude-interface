import type { Avaliacao } from "@/types/Entities";

const avaliacoesMock: Avaliacao[] = [
  {
    id: "1",
    authorName: "Maria Silva",
    rating: 5,
    comment: "Excelente atendimento e estrutura moderna.",
    createdAt: "2023-10-10",
  },
  {
    id: "2",
    authorName: "João Santos",
    rating: 5,
    comment: "Ótima equipe médica, recomendo muito.",
    createdAt: "2023-10-08",
  },
  {
    id: "3",
    authorName: "Ana Lima",
    rating: 4,
    comment: "Atendimento rápido e equipe atenciosa.",
    createdAt: "2023-10-02",
  },
];

export default avaliacoesMock;
