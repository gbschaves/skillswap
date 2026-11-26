import { db } from "@/lib/db";
import { pegarSessao } from "@/lib/auth";

export async function POST(req: Request) {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const encontroId = Number(body.encontroId);
  const nota = Number(body.nota);
  const comentario = String(body.comentario ?? "").trim().slice(0, 300);

  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    return Response.json({ erro: "A nota vai de 1 a 5" }, { status: 400 });
  }

  const encontro = await db.encontro.findUnique({ where: { id: encontroId } });
  const participa =
    encontro && (encontro.criadorId === sessao.userId || encontro.convidadoId === sessao.userId);
  if (!encontro || !participa) {
    return Response.json({ erro: "Encontro nao encontrado" }, { status: 404 });
  }
  if (encontro.status !== "realizado") {
    return Response.json({ erro: "So da pra avaliar depois do check-in" }, { status: 400 });
  }

  const jaAvaliou = await db.avaliacao.findUnique({
    where: { encontroId_deId: { encontroId, deId: sessao.userId } },
  });
  if (jaAvaliou) {
    return Response.json({ erro: "Voce ja avaliou esse encontro" }, { status: 409 });
  }

  const paraId = encontro.criadorId === sessao.userId ? encontro.convidadoId : encontro.criadorId;
  const avaliacao = await db.avaliacao.create({
    data: { encontroId, deId: sessao.userId, paraId, nota, comentario: comentario || null },
  });

  return Response.json(avaliacao, { status: 201 });
}
