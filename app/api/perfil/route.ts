import { db } from "@/lib/db";
import { pegarSessao } from "@/lib/auth";

async function buscarPerfil(userId: number) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { skills: { include: { skill: true } } },
  });
  if (!user) return null;

  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    cidade: user.cidade,
    bio: user.bio,
    ensina: user.skills.filter((s) => s.tipo === "ensina").map((s) => s.skill.nome),
    aprende: user.skills.filter((s) => s.tipo === "aprende").map((s) => s.skill.nome),
  };
}

// "Violao, excel , violao" -> ["violao", "excel"]
function limparLista(lista: unknown): string[] {
  if (!Array.isArray(lista)) return [];
  const nomes = lista.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  return [...new Set(nomes)].slice(0, 10);
}

export async function GET() {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const perfil = await buscarPerfil(sessao.userId);
  if (!perfil) return Response.json({ erro: "Usuario nao encontrado" }, { status: 404 });
  return Response.json(perfil);
}

export async function PUT(req: Request) {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  if (!body.nome || !String(body.nome).trim()) {
    return Response.json({ erro: "O nome nao pode ficar vazio" }, { status: 400 });
  }

  const ensina = limparLista(body.ensina);
  const aprende = limparLista(body.aprende);

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: sessao.userId },
      data: {
        nome: String(body.nome).trim(),
        cidade: body.cidade ? String(body.cidade).trim() : null,
        bio: body.bio ? String(body.bio).trim().slice(0, 300) : null,
      },
    });

    // apaga as skills antigas e grava a lista nova
    await tx.userSkill.deleteMany({ where: { userId: sessao.userId } });

    for (const [tipo, nomes] of [["ensina", ensina], ["aprende", aprende]] as const) {
      for (const nome of nomes) {
        const skill = await tx.skill.upsert({ where: { nome }, update: {}, create: { nome } });
        await tx.userSkill.create({ data: { tipo, userId: sessao.userId, skillId: skill.id } });
      }
    }
  });

  return Response.json(await buscarPerfil(sessao.userId));
}
