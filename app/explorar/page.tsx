"use client";

import { useEffect, useState } from "react";

type Pessoa = {
  id: number;
  nome: string;
  cidade: string | null;
  bio: string | null;
  ensina: string[];
  aprende: string[];
};

export default function PaginaExplorar() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch("/api/explorar")
      .then((res) => res.json())
      .then((dados) => {
        setPessoas(dados);
        setCarregando(false);
      });
  }, []);

  // sempre mostra a primeira da lista
  const atual = pessoas[0];

  async function responder(gostou: boolean) {
    if (!atual) return;
    setEnviando(true);
    setAviso("");

    const res = await fetch("/api/curtir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paraId: atual.id, gostou }),
    });
    const dados = await res.json();
    setEnviando(false);

    if (!res.ok) {
      setAviso(dados.erro);
      return;
    }
    if (dados.match) {
      setAviso("Deu match com " + atual.nome + "! Veja em Matches.");
    }
    setPessoas(pessoas.slice(1));
  }

  if (carregando) return <p className="p-6">Carregando...</p>;

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Explorar</h1>

      {aviso && (
        <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-emerald-800">{aviso}</p>
      )}

      {!atual ? (
        <p className="text-zinc-500">
          Nao tem mais ninguem por enquanto. Confira se voce preencheu o que ensina e o que quer aprender no seu perfil.
        </p>
      ) : (
        <div className="rounded-xl border border-zinc-300 p-6 dark:border-zinc-700">
          <h2 className="text-xl font-bold">{atual.nome}</h2>
          <p className="mb-3 text-sm text-zinc-500">{atual.cidade || "Cidade nao informada"}</p>
          {atual.bio && <p className="mb-3">{atual.bio}</p>}

          <p className="text-sm">
            <b>Ensina:</b> {atual.ensina.length > 0 ? atual.ensina.join(", ") : "-"}
          </p>
          <p className="mb-6 text-sm">
            <b>Quer aprender:</b> {atual.aprende.length > 0 ? atual.aprende.join(", ") : "-"}
          </p>

          <div className="flex gap-3">
            <button onClick={() => responder(false)} disabled={enviando} className="input flex-1">
              Passar
            </button>
            <button onClick={() => responder(true)} disabled={enviando} className="botao flex-1">
              Curtir
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
