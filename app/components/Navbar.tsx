import Link from "next/link";
import { pegarSessao } from "@/lib/auth";
import BotaoSair from "./BotaoSair";

export default async function Navbar() {
  const sessao = await pegarSessao();

  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
      <Link href="/" className="font-bold text-emerald-600">
        SkillSwap
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {sessao ? (
          <>
            <Link href="/perfil">Meu perfil</Link>
            <BotaoSair />
          </>
        ) : (
          <>
            <Link href="/login">Entrar</Link>
            <Link href="/cadastro">Cadastrar</Link>
          </>
        )}
      </div>
    </nav>
  );
}
