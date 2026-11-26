import { db } from "@/lib/db";
import { pegarSessao } from "@/lib/auth";
import { temMatch } from "@/lib/match";

export async function GET() {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const encontros = await db.encontro.findMany({
    where: { OR: [{ criadorId: sessao.userId }, { convidadoId: sessao.userId }] },
    include: { criador: true, convidado: true },
    orderBy: { dataHora: "asc" },
  });

  const lista = encontros.map((e) => ({
    id: e.id,
    local: e.local,
    dataHora: e.dataHora,
    status: e.status,
    codigo: e.codigo,
    souCriador: e.criadorId === sessao.userId,
    com: e.criadorId === sessao.userId ? e.convidado.nome : e.criador.nome,
  }));

  return Response.json(lista);
}

export async function POST(req: Request) {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const comId = Number(body.comId);
  const local = String(body.local ?? "").trim();
  const dataHora = new Date(body.dataHora);

  if (!comId || !local || isNaN(dataHora.getTime())) {
    return Response.json({ erro: "Preencha local, data e hora" }, { status: 400 });
  }
  if (local.length > 120) {
    return Response.json({ erro: "Local muito grande" }, { status: 400 });
  }
  if (dataHora < new Date()) {
    return Response.json({ erro: "Escolha uma data no futuro" }, { status: 400 });
  }
  if (!(await temMatch(sessao.userId, comId))) {
    return Response.json({ erro: "Voces ainda nao deram match" }, { status: 403 });
  }

  const encontro = await db.encontro.create({
    data: {
      criadorId: sessao.userId,
      convidadoId: comId,
      local,
      dataHora,
      codigo: crypto.randomUUID().slice(0, 6).toUpperCase(),
    },
  });

  return Response.json(encontro, { status: 201 });
}
