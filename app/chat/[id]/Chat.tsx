"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Mensagem = {
  id: number;
  texto: string;
  criadoEm: string;
  minha: boolean;
};

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const [nome, setNome] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const fim = useRef<HTMLDivElement>(null);

  type Resposta = { nome?: string; mensagens?: Mensagem[]; erro?: string };

  function aplicar(dados: Resposta) {
    if (dados.erro) {
      setErro(dados.erro);
      return;
    }
    setNome(dados.nome ?? "");
    setMensagens(dados.mensagens ?? []);
  }

  function carregar() {
    fetch("/api/chat/" + id)
      .then((res) => res.json())
      .then(aplicar);
  }

  useEffect(() => {
    fetch("/api/chat/" + id)
      .then((res) => res.json())
      .then(aplicar);
    // busca mensagens novas a cada 3 segundos
    const timer = setInterval(carregar, 3000);
    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!texto.trim()) return;

    const res = await fetch("/api/chat/" + id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    });
    if (!res.ok) {
      const dados = await res.json();
      setErro(dados.erro);
      return;
    }
    setTexto("");
    carregar();
  }

  if (erro && !nome) return <p className="p-6">{erro}</p>;

  return (
    <main className="mx-auto flex h-[calc(100vh-57px)] w-full max-w-lg flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">{nome || "Carregando..."}</h1>
        <Link href={"/encontros?com=" + id} className="text-sm text-emerald-600 underline">
          Marcar encontro
        </Link>
      </div>

      <div className="card flex-1 overflow-y-auto p-4">
        {mensagens.length === 0 && (
          <p className="text-center text-sm text-zinc-500">
            Voces deram match! Mande um oi e combinem a troca.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {mensagens.map((m) => (
            <div
              key={m.id}
              className={
                "max-w-[75%] rounded-2xl px-3 py-2 text-sm " +
                (m.minha
                  ? "self-end bg-emerald-600 text-white"
                  : "self-start bg-zinc-100 dark:bg-zinc-800")
              }
            >
              {m.texto}
              <span className="mt-1 block text-[10px] opacity-70">
                {new Date(m.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
        <div ref={fim} />
      </div>

      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}

      <form onSubmit={enviar} className="mt-3 flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={500}
          placeholder="Escreva uma mensagem..."
          className="input flex-1"
        />
        <button className="botao">Enviar</button>
      </form>
    </main>
  );
}
