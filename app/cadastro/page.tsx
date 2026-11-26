"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Cadastro() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });

    setCarregando(false);
    if (!res.ok) {
      const dados = await res.json();
      setErro(dados.erro);
      return;
    }
    router.push("/explorar");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6">
      <h1 className="mb-6 text-2xl font-bold">Criar conta</h1>
      <form onSubmit={enviar} className="flex flex-col gap-3">
        <input name="nome" placeholder="Nome" required className="input" />
        <input name="email" type="email" placeholder="Email" required className="input" />
        <input name="senha" type="password" placeholder="Senha (min. 6)" minLength={6} required className="input" />
        <input name="cidade" placeholder="Cidade" className="input" />
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button disabled={carregando} className="botao">
          {carregando ? "Criando..." : "Cadastrar"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Ja tem conta? <Link href="/login" className="text-emerald-600 underline">Entrar</Link>
      </p>
    </main>
  );
}
