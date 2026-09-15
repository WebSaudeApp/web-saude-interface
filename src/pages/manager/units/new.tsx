import { useEffect, useState, type FormEvent } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { managerRoutes } from "@/configs/Routes";
import { alertService } from "@/services/AlertService";
import type { Endereco, Horario } from "@/types/Entities";

type TabId = "info" | "endereco" | "especialidades" | "horarios" | "fotos";

const tabs: { id: TabId; label: string }[] = [
  { id: "info", label: "Informações" },
  { id: "endereco", label: "Endereço" },
  { id: "especialidades", label: "Especialidades" },
  { id: "horarios", label: "Horários" },
  { id: "fotos", label: "Fotos" },
];

const specialtyOptions = [
  "Cardiologia",
  "Ortopedia",
  "Pediatria",
  "Neurologia",
  "Dermatologia",
  "Clínica Geral",
  "Emergência",
];

const estadosBrasileiros = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const weekdayLabels = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function createDefaultHorarios(): Horario[] {
  return weekdayLabels.map((_, weekday) => ({
    weekday,
    opensAt: "08:00",
    closesAt: "18:00",
    active: weekday >= 1 && weekday <= 5,
  }));
}

const emptyEndereco: Endereco = {
  street: "",
  number: "",
  complement: "",
  city: "",
  state: "",
  zipCode: "",
};

type FotoPreview = {
  id: string;
  url: string;
};

export default function NovaUnidadePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("info");

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"hospital" | "clinica">("hospital");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nomeError, setNomeError] = useState<string | null>(null);

  const [endereco, setEndereco] = useState<Endereco>(emptyEndereco);

  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [especialidadeCustom, setEspecialidadeCustom] = useState("");

  const [horarios, setHorarios] = useState<Horario[]>(createDefaultHorarios);

  const [fotos, setFotos] = useState<FotoPreview[]>([]);

  useEffect(() => {
    return () => {
      fotos.forEach((foto) => URL.revokeObjectURL(foto.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateEndereco(field: keyof Endereco, value: string) {
    setEndereco((current) => ({ ...current, [field]: value }));
  }

  function toggleEspecialidade(specialty: string) {
    setEspecialidades((current) =>
      current.includes(specialty)
        ? current.filter((item) => item !== specialty)
        : [...current, specialty],
    );
  }

  function addEspecialidadeCustom() {
    const value = especialidadeCustom.trim();
    if (!value || especialidades.includes(value)) {
      return;
    }
    setEspecialidades((current) => [...current, value]);
    setEspecialidadeCustom("");
  }

  function updateHorario(weekday: number, changes: Partial<Horario>) {
    setHorarios((current) =>
      current.map((horario) =>
        horario.weekday === weekday ? { ...horario, ...changes } : horario,
      ),
    );
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const previews = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      url: URL.createObjectURL(file),
    }));
    setFotos((current) => [...current, ...previews]);
    event.target.value = "";
  }

  function removeFoto(id: string) {
    setFotos((current) => {
      const foto = current.find((item) => item.id === id);
      if (foto) {
        URL.revokeObjectURL(foto.url);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function setFotoPrincipal(id: string) {
    setFotos((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index <= 0) {
        return current;
      }
      const next = [...current];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
  }

  function validateNome() {
    if (!nome.trim()) {
      setNomeError("Informe o nome da unidade.");
      setActiveTab("info");
      return false;
    }
    setNomeError(null);
    return true;
  }

  function handleSaveDraft() {
    if (!validateNome()) {
      return;
    }
    alertService.success("Rascunho salvo.");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateNome()) {
      return;
    }
    alertService.success("Unidade enviada para aprovação.");
    setTimeout(() => {
      router.push(managerRoutes.units);
    }, 700);
  }

  return (
    <>
      <Head>
        <title>Web Saúde — Cadastrar unidade</title>
      </Head>
      <h1>Cadastrar nova unidade</h1>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "is-on" : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <form className="list" onSubmit={handleSubmit}>
        {activeTab === "info" ? (
          <section className="card panel">
            <h2>Informações</h2>
            <label className="field">
              <span>Nome da unidade</span>
              <input
                className="input"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
              />
            </label>
            {nomeError ? <p className="field-error">{nomeError}</p> : null}
            <div className="radio-group">
              <span className="label">Tipo</span>
              <label className="check">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === "clinica"}
                  onChange={() => setTipo("clinica")}
                />
                Clínica
              </label>
              <label className="check">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === "hospital"}
                  onChange={() => setTipo("hospital")}
                />
                Hospital
              </label>
            </div>
            <div className="form-grid-2">
              <label className="field">
                <span>E-mail</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="field">
                <span>WhatsApp</span>
                <input
                  className="input"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                />
              </label>
            </div>
            <label className="field">
              <span>Descrição</span>
              <textarea
                className="textarea"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
              />
            </label>
          </section>
        ) : null}

        {activeTab === "endereco" ? (
          <section className="card panel">
            <h2>Endereço</h2>
            <label className="field">
              <span>Rua</span>
              <input
                className="input"
                value={endereco.street}
                onChange={(event) =>
                  updateEndereco("street", event.target.value)
                }
              />
            </label>
            <div className="form-grid-3">
              <label className="field">
                <span>Número</span>
                <input
                  className="input"
                  value={endereco.number}
                  onChange={(event) =>
                    updateEndereco("number", event.target.value)
                  }
                />
              </label>
              <label className="field">
                <span>Complemento</span>
                <input
                  className="input"
                  value={endereco.complement}
                  onChange={(event) =>
                    updateEndereco("complement", event.target.value)
                  }
                />
              </label>
              <label className="field">
                <span>CEP</span>
                <input
                  className="input"
                  value={endereco.zipCode}
                  onChange={(event) =>
                    updateEndereco("zipCode", event.target.value)
                  }
                />
              </label>
            </div>
            <div className="form-grid-2">
              <label className="field">
                <span>Cidade</span>
                <input
                  className="input"
                  value={endereco.city}
                  onChange={(event) =>
                    updateEndereco("city", event.target.value)
                  }
                />
              </label>
              <label className="field">
                <span>Estado</span>
                <select
                  className="select"
                  value={endereco.state}
                  onChange={(event) =>
                    updateEndereco("state", event.target.value)
                  }
                >
                  <option value="">Selecione</option>
                  {estadosBrasileiros.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {activeTab === "especialidades" ? (
          <section className="card panel">
            <h2>Especialidades</h2>
            {specialtyOptions.map((specialty) => (
              <label className="check" key={specialty}>
                <input
                  type="checkbox"
                  checked={especialidades.includes(specialty)}
                  onChange={() => toggleEspecialidade(specialty)}
                />
                {specialty}
              </label>
            ))}
            {especialidades
              .filter((specialty) => !specialtyOptions.includes(specialty))
              .map((specialty) => (
                <label className="check" key={specialty}>
                  <input
                    type="checkbox"
                    checked
                    onChange={() => toggleEspecialidade(specialty)}
                  />
                  {specialty}
                </label>
              ))}
            <div className="form-grid-2">
              <label className="field">
                <span>Especialidade customizada</span>
                <input
                  className="input"
                  value={especialidadeCustom}
                  onChange={(event) =>
                    setEspecialidadeCustom(event.target.value)
                  }
                />
              </label>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={addEspecialidadeCustom}
              >
                Adicionar
              </button>
            </div>
          </section>
        ) : null}

        {activeTab === "horarios" ? (
          <section className="card panel">
            <h2>Horários</h2>
            {horarios.map((horario) => (
              <div className="hours-row" key={horario.weekday}>
                <span>{weekdayLabels[horario.weekday]}</span>
                <label className="field">
                  <span>Abre</span>
                  <input
                    className="input"
                    type="time"
                    value={horario.opensAt}
                    onChange={(event) =>
                      updateHorario(horario.weekday, {
                        opensAt: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>Fecha</span>
                  <input
                    className="input"
                    type="time"
                    value={horario.closesAt}
                    onChange={(event) =>
                      updateHorario(horario.weekday, {
                        closesAt: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={horario.active}
                    onChange={(event) =>
                      updateHorario(horario.weekday, {
                        active: event.target.checked,
                      })
                    }
                  />
                  Ativo
                </label>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "fotos" ? (
          <section className="card panel">
            <h2>Fotos</h2>
            <input
              className="input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
            />
            <p className="help">
              Arraste arquivos ou selecione. A primeira foto será a principal.
            </p>
            {fotos.length > 0 ? (
              <div className="photo-grid">
                {fotos.map((foto, index) => (
                  <div
                    className={`photo-thumb${index === 0 ? " is-main" : ""}`}
                    key={foto.id}
                  >
                    <img
                      src={foto.url}
                      alt=""
                      onClick={() => setFotoPrincipal(foto.id)}
                    />
                    {index === 0 ? (
                      <span className="badge-main">Principal</span>
                    ) : null}
                    <button
                      type="button"
                      aria-label="Remover foto"
                      onClick={() => removeFoto(foto.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="form-actions">
          <Link className="btn btn-ghost" href={managerRoutes.units}>
            Cancelar
          </Link>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={handleSaveDraft}
          >
            Salvar como rascunho
          </button>
          <button className="btn btn-primary" type="submit">
            Enviar para aprovação
          </button>
        </div>
      </form>
    </>
  );
}
