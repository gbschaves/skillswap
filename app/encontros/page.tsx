"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Avaliar from "./Avaliar";
import CheckIn from "./CheckIn";

type Encontro = {
  id: number;
  local: string;
  dataHora: string;
  status: string;
  codigo: string;
  souCriador: boolean;
  com: string;
};

export default function PaginaEncontros() {
  const router = useRouter();
  const [encontros, setEncontros] = useState<Encontro[]>([]);
  const [comId, setComId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");

  function carregar() {
    fetch("/api/encontros")
      .then((res) => res.json())
      .then(setEncontros);
  }

  useEffect(() => {
    setComId(new URLSearchParams(window.location.search).get("com"));
    carregar();
  }, []);

  async function propor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/encontros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comId,
        local: form.get("local"),
        dataHora: new Date(String(form.get("dataHora"))).toISOString(),
      }),
    });

    const dados = await res.json();
    if (!res.ok) {
      setMensagem(dados.erro);
      return;
    }
    setMensagem("Encontro proposto! Agora e so esperar a outra pessoa aceitar.");
    setComId(null);
    carregar();
  }

  async function aceitar(id: number) {
    await fetch("/api/encontros/" + id, { method: "PATCH" });
    carregar();
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Encontros</h1>

      {comId && (
        <form onSubmit={propor} className="mb-8 flex flex-col gap-4 rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
          <h2 className="font-bold">Marcar encontro</h2>
          <p className="text-sm text-zinc-500">
            Por seguranca escolha um lugar publico: biblioteca, cafe, praca, shopping...
          </p>
          <label className="flex flex-col gap-1">
            Local
            <input name="local" required maxLength={120} placeholder="Biblioteca Mario de Andrade" className="input" />
          </label>
          <label className="flex flex-col gap-1">
            Data e hora
            <input name="dataHora" type="datetime-local" required className="input" />
          </label>
          <button className="botao">Propor encontro</button>
        </form>
      )}

      {mensagem && <p className="mb-4 text-sm">{mensagem}</p>}

      {encontros.length === 0 && <p className="text-zinc-500">Nenhum encontro marcado ainda.</p>}

      <div className="flex flex-col gap-4">
        {encontros.map((e) => (
          <div key={e.id} className="rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
            <h2 className="font-bold">Com {e.com}</h2>
            <p className="text-sm">{e.local}</p>
            <p className="text-sm">{new Date(e.dataHora).toLocaleString("pt-BR")}</p>
            <p className="text-sm text-zinc-500">Status: {e.status}</p>
            {e.status === "realizado" && <Avaliar encontroId={e.id} />}
            {e.status === "aceito" && (
              <CheckIn encontroId={e.id} codigo={e.codigo} souCriador={e.souCriador} aoConfirmar={carregar} />
            )}
            {!e.souCriador && e.status === "proposto" && (
              <button onClick={() => aceitar(e.id)} className="botao mt-2">
                Aceitar
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
