"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

type Props = {
  encontroId: number;
  codigo: string;
  souCriador: boolean;
  aoConfirmar: () => void;
};

export default function CheckIn({ encontroId, codigo, souCriador, aoConfirmar }: Props) {
  const [qr, setQr] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (souCriador) QRCode.toDataURL(codigo).then(setQr);
  }, [codigo, souCriador]);

  async function confirmar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/encontros/" + encontroId + "/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: form.get("codigo") }),
    });

    if (!res.ok) {
      const dados = await res.json();
      setErro(dados.erro);
      return;
    }
    aoConfirmar();
  }

  if (souCriador) {
    return (
      <div className="mt-3 text-sm">
        <p>No dia, mostre esse QR pra outra pessoa:</p>
        {qr && <img src={qr} alt={"QR code " + codigo} className="my-2 h-40 w-40" />}
        <p>
          Codigo: <b>{codigo}</b>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={confirmar} className="mt-3 flex flex-col gap-2 text-sm">
      <label className="flex flex-col gap-1">
        Chegou? Leia o QR da outra pessoa e digite o codigo
        <input name="codigo" required maxLength={6} className="input uppercase" />
      </label>
      {erro && <p className="text-red-600">{erro}</p>}
      <button className="botao">Fazer check-in</button>
    </form>
  );
}
