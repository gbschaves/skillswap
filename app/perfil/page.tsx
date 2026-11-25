"use client";

import { useEffect, useState } from "react";

type Perfil = {
  nome: string;
  email: string;
  cidade: string | null;
  bio: string | null;
  ensina: string[];
  aprende: string[];
};

// "violao, excel" -> ["violao", "excel"]
function paraLista(texto: string) {
  return texto.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function PaginaPerfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/perfil")
      .then((res) => res.json())
      .then(setPerfil);
  }, []);

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvando(true);
    setMensagem("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.get("nome"),
        cidade: form.get("cidade"),
        bio: form.get("bio"),
        ensina: paraLista(String(form.get("ensina"))),
        aprende: paraLista(String(form.get("aprende"))),
      }),
    });

    const dados = await res.json();
    setSalvando(false);
    if (!res.ok) {
      setMensagem(dados.erro);
      return;
    }
    setPerfil(dados);
    setMensagem("Perfil salvo!");
  }

  if (!perfil) return <p className="p-6">Carregando...</p>;

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
      <h1 className="text-2xl font-bold">Meu perfil</h1>
      <p className="mb-6 text-sm text-zinc-500">{perfil.email}</p>

      <form onSubmit={salvar} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          Nome
          <input name="nome" defaultValue={perfil.nome} required className="input" />
        </label>
        <label className="flex flex-col gap-1">
          Cidade
          <input name="cidade" defaultValue={perfil.cidade ?? ""} className="input" />
        </label>
        <label className="flex flex-col gap-1">
          Sobre voce
          <textarea name="bio" defaultValue={perfil.bio ?? ""} maxLength={300} rows={3} className="input" />
        </label>
        <label className="flex flex-col gap-1">
          O que eu posso ensinar <span className="text-xs text-zinc-500">separe por virgula</span>
          <input name="ensina" defaultValue={perfil.ensina.join(", ")} placeholder="violao, excel" className="input" />
        </label>
        <label className="flex flex-col gap-1">
          O que eu quero aprender <span className="text-xs text-zinc-500">separe por virgula</span>
          <input name="aprende" defaultValue={perfil.aprende.join(", ")} placeholder="ingles, culinaria" className="input" />
        </label>

        {mensagem && <p className="text-sm">{mensagem}</p>}
        <button disabled={salvando} className="botao">
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </main>
  );
}
