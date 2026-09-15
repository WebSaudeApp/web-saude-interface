export type UserRole = "visitor" | "common" | "functional" | "admin";

export type UnidadeTipo = "hospital" | "clinica" | "pronto_atendimento";

export type UnidadeStatus = "rascunho" | "publicado";

export type AprovacaoStatus = "pendente" | "aprovado" | "rejeitado";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Exclude<UserRole, "visitor">;
  avatarUrl?: string;
};

export type Endereco = {
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
};

export type Horario = {
  weekday: number;
  opensAt: string;
  closesAt: string;
  active: boolean;
};

export type Avaliacao = {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type MinhaAvaliacao = {
  id: string;
  unidadeId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Unidade = {
  id: string;
  name: string;
  type: UnidadeTipo;
  description?: string;
  email?: string;
  whatsapp?: string;
  phone?: string;
  website?: string;
  address: Endereco;
  specialties: string[];
  hours: Horario[];
  photos: string[];
  rating: number;
  reviewCount: number;
  distanceKm: number;
  scheduleLabel: string;
  insurances: string[];
  open24h: boolean;
  status: UnidadeStatus;
  approval: AprovacaoStatus;
  featured?: boolean;
  openNow?: boolean;
};

export type Session = {
  user: User;
  token: string;
};
