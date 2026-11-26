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
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Meus matches</h1>

      {matches.length === 0 && (
        <p className="text-zinc-500">Voce ainda nao tem matches. Va em Explorar e curta algumas pessoas!</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {matches.map((m) => (
          <div key={m.id} className="card flex flex-col">
            <div className="flex h-20 items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600">
              <span className="text-3xl font-bold text-white">
                {m.nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="font-bold">{m.nome}</h2>
              <p className="mb-2 text-sm text-zinc-500">{m.cidade || "Cidade nao informada"}</p>
              <div className="mb-1 flex flex-wrap gap-1">
                {m.ensina.map((s) => (
                  <span key={s} className="chip bg-emerald-100 text-emerald-800">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mb-3 flex flex-wrap gap-1">
                {m.aprende.map((s) => (
                  <span key={s} className="chip bg-sky-100 text-sky-800">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex gap-2">
                <Link href={"/chat/" + m.id} className="botao flex-1 text-center">
                  Conversar
                </Link>
                <Link href={"/encontros?com=" + m.id} className="input flex-1 text-center text-sm">
                  Marcar encontro
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
