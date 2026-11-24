"use client";

import { useRouter } from "next/navigation";

export default function BotaoSair() {
  const router = useRouter();

  async function sair() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={sair} className="text-red-600 hover:underline">
      Sair
    </button>
  );
}
