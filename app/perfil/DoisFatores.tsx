"use client";

import { useEffect, useState } from "react";

export default function DoisFatores() {
  const [ativo, setAtivo] = useState<boolean | null>(null);
  const [qr, setQr] = useState("");
  const [segredo, setSegredo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetch("/api/2fa")
      .then((res) => res.json())
      .then((dados) => setAtivo(dados.ativo));
  }, []);

  async function chamar(method: string, body: object) {
    setMensagem("");
    const res = await fetch("/api/2fa", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const dados = await res.json();
    if (!res.ok) setMensagem(dados.erro);
    return res.ok ? dados : null;
  }

  async function gerar() {
    const dados = await chamar("POST", {});
    if (dados) {
      setQr(dados.qr);
      setSegredo(dados.segredo);
    }
  }

  async function ativar() {
    if (await chamar("POST", { segredo, codigo })) {
      setAtivo(true);
      setQr("");
      setCodigo("");
      setMensagem("2FA ligado!");
    }
  }

  async function desativar() {
    if (await chamar("DELETE", { codigo })) {
      setAtivo(false);
      setCodigo("");
      setMensagem("2FA desligado");
    }
  }

  if (ativo === null) return null;

  return (
    <section className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h2 className="mb-2 font-bold">Verificacao em duas etapas</h2>

      {!ativo && !qr && (
        <>
          <p className="mb-3 text-sm text-zinc-500">
            Alem da senha, o login vai pedir um codigo do Google Authenticator ou Authy.
          </p>
          <button onClick={gerar} className="botao">
            Ligar 2FA
          </button>
        </>
      )}

      {qr && (
        <>
          <p className="mb-2 text-sm">Escaneie no app autenticador e digite o codigo que aparecer:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code do 2FA" className="mb-3 h-44 w-44 rounded bg-white p-2" />
        </>
      )}

      {(qr || ativo) && (
        <div className="flex gap-2">
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            className="input flex-1"
          />
          <button onClick={qr ? ativar : desativar} className={qr ? "botao" : "input"}>
            {qr ? "Confirmar" : "Desligar 2FA"}
          </button>
        </div>
      )}

      {ativo && <p className="mt-2 text-sm text-emerald-600">2FA ligado na sua conta.</p>}
      {mensagem && <p className="mt-2 text-sm">{mensagem}</p>}
    </section>
  );
}
