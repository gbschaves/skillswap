import { db } from "@/lib/db";
import { pegarSessao } from "@/lib/auth";

export async function GET() {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const minhasSkills = await db.userSkill.findMany({ where: { userId: sessao.userId } });
  const queroAprender = minhasSkills.filter((s) => s.tipo === "aprende").map((s) => s.skillId);
  const sei = minhasSkills.filter((s) => s.tipo === "ensina").map((s) => s.skillId);

  const jaVistas = await db.curtida.findMany({ where: { deId: sessao.userId } });
  const idsJaVistos = jaVistas.map((c) => c.paraId);

  // ensina o que eu quero aprender OU quer aprender o que eu ensino
  const usuarios = await db.user.findMany({
    where: {
      id: { notIn: [sessao.userId, ...idsJaVistos] },
      skills: {
        some: {
          OR: [
            { tipo: "ensina", skillId: { in: queroAprender } },
            { tipo: "aprende", skillId: { in: sei } },
          ],
        },
      },
    },
    include: { skills: { include: { skill: true } } },
  });

  const lista = usuarios.map((u) => ({
    id: u.id,
    nome: u.nome,
    cidade: u.cidade,
    bio: u.bio,
    ensina: u.skills.filter((s) => s.tipo === "ensina").map((s) => s.skill.nome),
    aprende: u.skills.filter((s) => s.tipo === "aprende").map((s) => s.skill.nome),
  }));

  return Response.json(lista);
}
