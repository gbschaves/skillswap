import { db } from "@/lib/db";
import { pegarSessao } from "@/lib/auth";

export async function GET() {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const minhasCurtidas = await db.curtida.findMany({
    where: { deId: sessao.userId, gostou: true },
  });
  const idsQueCurti = minhasCurtidas.map((c) => c.paraId);

  const curtidasDeVolta = await db.curtida.findMany({
    where: { paraId: sessao.userId, gostou: true, deId: { in: idsQueCurti } },
  });
  const idsMatches = curtidasDeVolta.map((c) => c.deId);

  const usuarios = await db.user.findMany({
    where: { id: { in: idsMatches } },
    include: { skills: { include: { skill: true } } },
  });

  const lista = usuarios.map((u) => ({
    id: u.id,
    nome: u.nome,
    cidade: u.cidade,
    ensina: u.skills.filter((s) => s.tipo === "ensina").map((s) => s.skill.nome),
    aprende: u.skills.filter((s) => s.tipo === "aprende").map((s) => s.skill.nome),
  }));

  return Response.json(lista);
}
