import Link from "next/link";
import { pegarSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import BotaoSair from "./BotaoSair";

export default async function Navbar() {
  const sessao = await pegarSessao();
  // convites de encontro que ainda estao esperando eu aceitar
  const pendentes = sessao
    ? await db.encontro.count({ where: { convidadoId: sessao.userId, status: "proposto" } })
    : 0;

  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
      <Link href="/" className="font-bold text-emerald-600">
        SkillSwap
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {sessao && (
          <>
            <Link href="/explorar">Explorar</Link>
            <Link href="/matches">Matches</Link>
            <Link href="/encontros">
              Encontros
              {pendentes > 0 && (
                <span className="ml-1 rounded-full bg-emerald-600 px-2 text-xs text-white">{pendentes}</span>
              )}
            </Link>
            <Link href="/perfil">Meu perfil</Link>
            <BotaoSair />
          </>
        )}
      </div>
    </nav>
  );
}
