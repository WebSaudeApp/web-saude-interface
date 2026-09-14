export type Cidade = {
  nome: string;
  uf: string;
};

const cidades: Cidade[] = [
  { nome: "São Paulo", uf: "SP" },
  { nome: "Rio de Janeiro", uf: "RJ" },
  { nome: "Belo Horizonte", uf: "MG" },
];

export default cidades;
