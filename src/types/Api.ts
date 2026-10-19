// Shapes returned by web-saude-api (GET /estabelecimentos and related).

export type ApiDiaSemana =
  "DOMINGO" | "SEGUNDA" | "TERCA" | "QUARTA" | "QUINTA" | "SEXTA" | "SABADO";

export type ApiTipoContato = "TELEFONE" | "WHATSAPP" | "EMAIL" | "SITE";

export type ApiEstabelecimento = {
  id: string;
  nome: string;
  tipo: { id: string; nome: string };
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string | null;
    bairro?: string | null;
    cidade: string;
    estado: string;
    latitude: number;
    longitude: number;
  };
  contatos: { id: string; tipo: ApiTipoContato; valor: string }[];
  especialidades: { id: string; nome: string }[];
  horarios: {
    id: string;
    diaSemana: ApiDiaSemana;
    horaAbertura: string;
    horaFechamento: string;
    atende24h: boolean;
  }[];
  midias: { id: string; tipo: string; url: string; legenda?: string | null }[];
  distanciaKm?: number;
  notaMedia?: number;
  totalReviews?: number;
};

export type ApiPaginacao = {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  temMais: boolean;
};

export type ApiPaginada<T> = {
  dados: T[];
  paginacao: ApiPaginacao;
};

export type ApiEspecialidade = {
  id: string;
  nome: string;
};
