"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Pessoa = {
  id: number;
  nome: string;
  cidade: string | null;
  bio: string | null;
  ensina: string[];
  aprende: string[];
};

// quanto precisa arrastar pro lado pra contar como pular/curtir
const LIMITE = 110;

function iniciais(nome: string) {
  return nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PaginaExplorar() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [match, setMatch] = useState<Pessoa | null>(null);

  const [dx, setDx] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const [saindo, setSaindo] = useState<"pular" | "curtir" | null>(null);
  const inicioX = useRef(0);

  useEffect(() => {
    fetch("/api/explorar")
      .then((res) => res.json())
      .then((dados) => {
        setPessoas(dados);
        setCarregando(false);
      });
  }, []);

  const atual = pessoas[0];
  const proxima = pessoas[1];

  function decidir(gostou: boolean) {
    if (!atual || saindo) return;
    setSaindo(gostou ? "curtir" : "pular");
    setDx(gostou ? 600 : -600);

    // espera a animacao do card sair antes de trocar
    setTimeout(() => enviar(atual, gostou), 300);
  }

  async function enviar(pessoa: Pessoa, gostou: boolean) {
    const res = await fetch("/api/curtir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paraId: pessoa.id, gostou }),
    });
    const dados = await res.json();

    if (!res.ok) {
      setErro(dados.erro);
    } else if (dados.match) {
      setMatch(pessoa);
    }
    setPessoas((lista) => lista.slice(1));
    setDx(0);
    setSaindo(null);
  }

  function aoApertar(e: React.PointerEvent<HTMLDivElement>) {
    if (saindo) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    inicioX.current = e.clientX;
    setArrastando(true);
  }

  function aoMover(e: React.PointerEvent<HTMLDivElement>) {
    if (!arrastando) return;
    setDx(e.clientX - inicioX.current);
  }

  function aoSoltar() {
    if (!arrastando) return;
    setArrastando(false);
    if (dx > LIMITE) decidir(true);
    else if (dx < -LIMITE) decidir(false);
    else setDx(0);
  }

  if (carregando) return <p className="p-6">Carregando...</p>;

  const forca = Math.min(Math.abs(dx) / LIMITE, 1);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">Explorar</h1>

      {erro && <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">{erro}</p>}

      {!atual ? (
        <p className="text-zinc-500">
          Nao tem mais ninguem por enquanto. Confira se voce preencheu o que ensina e o que quer aprender no seu{" "}
          <Link href="/perfil" className="text-emerald-600 underline">
            perfil
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="relative h-[430px] select-none">
            {proxima && (
              <div className="card absolute inset-0 scale-95 opacity-70">
                <Conteudo pessoa={proxima} />
              </div>
            )}

            <div
              key={atual.id}
              onPointerDown={aoApertar}
              onPointerMove={aoMover}
              onPointerUp={aoSoltar}
              onPointerCancel={aoSoltar}
              className="card absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
              style={{
                transform: `translateX(${dx}px) rotate(${dx / 15}deg)`,
                transition: arrastando ? "none" : "transform 0.3s ease",
              }}
            >
              <span
                className="selo left-4 rotate-[-15deg] border-emerald-500 text-emerald-500"
                style={{ opacity: dx > 0 ? forca : 0 }}
              >
                CURTIR
              </span>
              <span
                className="selo right-4 rotate-[15deg] border-red-500 text-red-500"
                style={{ opacity: dx < 0 ? forca : 0 }}
              >
                PULAR
              </span>
              <Conteudo pessoa={atual} />
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-8">
            <button
              onClick={() => decidir(false)}
              disabled={!!saindo}
              aria-label="Pular"
              className={
                "redondo border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 " +
                (saindo === "pular" || dx < -LIMITE / 2 ? "scale-110 bg-red-50 dark:bg-red-950" : "")
              }
            >
              ✕
            </button>
            <button
              onClick={() => decidir(true)}
              disabled={!!saindo}
              aria-label="Curtir"
              className={
                "redondo border-emerald-400 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 " +
                (saindo === "curtir" || dx > LIMITE / 2 ? "scale-110 bg-emerald-50 dark:bg-emerald-950" : "")
              }
            >
              ♥
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-zinc-500">Arraste o card ou use os botoes</p>
        </>
      )}

      {match && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center dark:bg-zinc-900">
            <p className="text-3xl font-bold text-emerald-600">Deu match!</p>
            <p className="mt-2">Voce e {match.nome} podem trocar skills.</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href={"/chat/" + match.id} className="botao">
                Mandar mensagem
              </Link>
              <button onClick={() => setMatch(null)} className="input">
                Continuar explorando
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Conteudo({ pessoa }: { pessoa: Pessoa }) {
  return (
    <>
      <div className="flex h-36 items-center justify-center rounded-t-2xl bg-gradient-to-br from-emerald-400 to-teal-600">
        <span className="text-5xl font-bold text-white">{iniciais(pessoa.nome)}</span>
      </div>
      <div className="p-5">
        <h2 className="text-xl font-bold">{pessoa.nome}</h2>
        <p className="mb-3 text-sm text-zinc-500">{pessoa.cidade || "Cidade nao informada"}</p>
        {pessoa.bio && <p className="mb-3 line-clamp-2 text-sm">{pessoa.bio}</p>}

        <p className="mb-1 text-xs font-bold uppercase text-zinc-500">Ensina</p>
        <div className="mb-3 flex flex-wrap gap-1">
          {pessoa.ensina.map((s) => (
            <span key={s} className="chip bg-emerald-100 text-emerald-800">
              {s}
            </span>
          ))}
          {pessoa.ensina.length === 0 && <span className="text-sm">-</span>}
        </div>

        <p className="mb-1 text-xs font-bold uppercase text-zinc-500">Quer aprender</p>
        <div className="flex flex-wrap gap-1">
          {pessoa.aprende.map((s) => (
            <span key={s} className="chip bg-sky-100 text-sky-800">
              {s}
            </span>
          ))}
          {pessoa.aprende.length === 0 && <span className="text-sm">-</span>}
        </div>
      </div>
    </>
  );
}
