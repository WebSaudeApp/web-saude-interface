import type { AdminUsuario } from "@/types/Entities";

const usuariosMock: AdminUsuario[] = [
  {
    id: "1",
    name: "Carlos Silva",
    email: "carlos@exemplo.com",
    role: "admin",
    status: "ativo",
  },
  {
    id: "2",
    name: "Maria Souza",
    email: "maria@exemplo.com",
    role: "functional",
    status: "ativo",
  },
  {
    id: "3",
    name: "João Mendes",
    email: "joao@exemplo.com",
    role: "common",
    status: "ativo",
  },
  {
    id: "4",
    name: "Beatriz Alves",
    email: "beatriz@exemplo.com",
    role: "common",
    status: "ativo",
  },
  {
    id: "5",
    name: "Diego Torres",
    email: "diego@exemplo.com",
    role: "functional",
    status: "ativo",
  },
  {
    id: "6",
    name: "Fernanda Lima",
    email: "fernanda@exemplo.com",
    role: "common",
    status: "inativo",
  },
];

export default usuariosMock;
