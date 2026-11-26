import { db } from "@/lib/db";
import { pegarSessao } from "@/lib/auth";
import { temMatch } from "@/lib/match";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Contexto) {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const comId = Number((await params).id);
  if (!(await temMatch(sessao.userId, comId))) {
    return Response.json({ erro: "Voces ainda nao deram match" }, { status: 403 });
  }

  const outro = await db.user.findUnique({ where: { id: comId } });
  const mensagens = await db.mensagem.findMany({
    where: {
      OR: [
        { deId: sessao.userId, paraId: comId },
        { deId: comId, paraId: sessao.userId },
      ],
    },
    orderBy: { criadoEm: "asc" },
    take: 200,
  });

  return Response.json({
    nome: outro?.nome,
    mensagens: mensagens.map((m) => ({
      id: m.id,
      texto: m.texto,
      criadoEm: m.criadoEm,
      minha: m.deId === sessao.userId,
    })),
  });
}

export async function POST(req: Request, { params }: Contexto) {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const comId = Number((await params).id);
  const body = await req.json();
  const texto = String(body.texto ?? "").trim();

  if (!texto) return Response.json({ erro: "Mensagem vazia" }, { status: 400 });
  if (texto.length > 500) return Response.json({ erro: "Mensagem muito grande" }, { status: 400 });
  if (!(await temMatch(sessao.userId, comId))) {
    return Response.json({ erro: "Voces ainda nao deram match" }, { status: 403 });
  }

  const mensagem = await db.mensagem.create({
    data: { deId: sessao.userId, paraId: comId, texto },
  });
  return Response.json(mensagem, { status: 201 });
}
