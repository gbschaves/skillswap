"use client";

import { useState } from "react";

export default function Avaliar({ encontroId }: { encontroId: number }) {
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/avaliacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encontroId,
        nota: Number(form.get("nota")),
        comentario: form.get("comentario"),
      }),
    });

    const dados = await res.json();
    if (!res.ok) {
      setMensagem(dados.erro);
      if (res.status === 409) setEnviado(true);
      return;
    }
    setEnviado(true);
    setMensagem("Obrigado pela avaliacao!");
  }

  if (enviado) return <p className="mt-2 text-sm">{mensagem}</p>;

  return (
    <form onSubmit={enviar} className="mt-3 flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm">
        Como foi a troca?
        <select name="nota" defaultValue="5" className="input">
          <option value="5">5 - Otima</option>
          <option value="4">4 - Boa</option>
          <option value="3">3 - Normal</option>
          <option value="2">2 - Ruim</option>
          <option value="1">1 - Pessima</option>
        </select>
      </label>
      <textarea name="comentario" maxLength={300} rows={2} placeholder="Comentario (opcional)" className="input" />
      {mensagem && <p className="text-sm">{mensagem}</p>}
      <button className="botao">Avaliar</button>
    </form>
  );
}
