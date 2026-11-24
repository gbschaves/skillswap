import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold">SkillSwap</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Ensine o que você sabe, aprenda o que você quer. O match acontece aqui,
        a troca acontece pessoalmente.
      </p>
      <div className="flex gap-3">
        <Link
          href="/cadastro"
          className="rounded-full bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
        >
          Criar conta
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-zinc-300 px-6 py-3 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Entrar
        </Link>
      </div>
    </main>
  );
}
