import type {
  ApiDiaSemana,
  ApiEstabelecimento,
  ApiTipoContato,
} from "@/types/Api";
import type { Horario, Unidade, UnidadeTipo } from "@/types/Entities";

const weekdays: Record<ApiDiaSemana, number> = {
  DOMINGO: 0,
  SEGUNDA: 1,
  TERCA: 2,
  QUARTA: 3,
  QUINTA: 4,
  SEXTA: 5,
  SABADO: 6,
};

const types: Record<string, UnidadeTipo> = {
  HOSPITAL: "hospital",
  CLINICA: "clinica",
};

// Front type -> value expected by the API `tipo` filter.
export const apiTipoByType: Record<UnidadeTipo, string> = {
  hospital: "HOSPITAL",
  clinica: "CLINICA",
  pronto_atendimento: "PRONTO_ATENDIMENTO",
};

function contato(item: ApiEstabelecimento, tipo: ApiTipoContato) {
  return item.contatos.find((c) => c.tipo === tipo)?.valor;
}

// "8699100027" -> "(86) 9910-0027"; "86988200027" -> "(86) 98820-0027".
export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 11) {
    return value;
  }
  const split = digits.length - 4;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, split)}-${digits.slice(split)}`;
}

function minutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

// The API stores hours per weekday; the cards show today's situation.
function schedule(hours: Horario[], open24h: boolean, now: Date) {
  if (open24h) {
    return { label: "Aberto 24 horas", openNow: true };
  }
  const today = hours.find((hour) => hour.weekday === now.getDay());
  if (!today) {
    return { label: "Fechado hoje", openNow: false };
  }
  const current = now.getHours() * 60 + now.getMinutes();
  return {
    label: `Hoje: ${today.opensAt} – ${today.closesAt}`,
    openNow:
      current >= minutes(today.opensAt) && current < minutes(today.closesAt),
  };
}

export function fromApiEstabelecimento(
  item: ApiEstabelecimento,
  now = new Date(),
): Unidade {
  const hours: Horario[] = item.horarios.map((horario) => ({
    weekday: weekdays[horario.diaSemana],
    opensAt: horario.horaAbertura,
    closesAt: horario.horaFechamento,
    active: true,
  }));
  const open24h = item.horarios.some((horario) => horario.atende24h);
  const { label, openNow } = schedule(hours, open24h, now);
  const phone = contato(item, "TELEFONE");
  const whatsapp = contato(item, "WHATSAPP");

  return {
    id: item.id,
    name: item.nome,
    type: types[item.tipo.nome] ?? "clinica",
    email: contato(item, "EMAIL"),
    phone: phone ? formatPhone(phone) : undefined,
    whatsapp: whatsapp ? formatPhone(whatsapp) : undefined,
    website: contato(item, "SITE"),
    address: {
      street: item.endereco.logradouro,
      number: item.endereco.numero,
      // The cards show the neighborhood in this slot.
      complement:
        item.endereco.bairro ?? item.endereco.complemento ?? undefined,
      city: item.endereco.cidade,
      state: item.endereco.estado,
      zipCode: item.endereco.cep,
    },
    specialties: item.especialidades.map((especialidade) => especialidade.nome),
    hours,
    // "/midias/:id" is served through this site's /api/media proxy.
    photos: item.midias
      .filter((midia) => midia.tipo === "FOTO")
      .map((midia) => midia.url.replace(/^\/midias\//, "/api/media/")),
    rating: item.notaMedia ?? 0,
    reviewCount: item.totalReviews ?? 0,
    distanceKm: item.distanciaKm ?? 0,
    location: { lat: item.endereco.latitude, lng: item.endereco.longitude },
    scheduleLabel: label,
    insurances: [],
    open24h,
    // The API has no approval workflow yet: what it returns is public.
    status: "publicado",
    approval: "aprovado",
    openNow,
  };
}
