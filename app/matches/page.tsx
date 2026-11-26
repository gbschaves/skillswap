"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Match = {
  id: number;
  nome: string;
  cidade: string | null;
  ensina: string[];
  aprende: string[];
};

export default function PaginaMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((dados) => {
        setMatches(dados);
        setCarregando(false);
      });
  }, []);

  if (carregando) return <p className="p-6">Carregando...</p>;

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Meus matches</h1>

      {matches.length === 0 && (
        <p className="text-zinc-500">Voce ainda nao tem matches. Va em Explorar e curta algumas pessoas!</p>
      )}

      <div className="flex flex-col gap-4">
        {matches.map((m) => (
          <div key={m.id} className="rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
            <h2 className="font-bold">{m.nome}</h2>
            <p className="mb-2 text-sm text-zinc-500">{m.cidade || "Cidade nao informada"}</p>
            <p className="text-sm">
              <b>Ensina:</b> {m.ensina.length > 0 ? m.ensina.join(", ") : "-"}
            </p>
            <p className="text-sm">
              <b>Quer aprender:</b> {m.aprende.length > 0 ? m.aprende.join(", ") : "-"}
            </p>
            <Link href={"/encontros?com=" + m.id} className="botao mt-3 inline-block">
              Marcar encontro
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
