import { db } from "@/lib/db";
import { pegarSessao } from "@/lib/auth";

export async function POST(req: Request) {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const paraId = Number(body.paraId);
  const gostou = body.gostou === true;

  if (!paraId) {
    return Response.json({ erro: "paraId invalido" }, { status: 400 });
  }
  if (paraId === sessao.userId) {
    return Response.json({ erro: "Voce nao pode curtir voce mesmo" }, { status: 400 });
  }

  const outraPessoa = await db.user.findUnique({ where: { id: paraId } });
  if (!outraPessoa) {
    return Response.json({ erro: "Usuario nao encontrado" }, { status: 404 });
  }

  await db.curtida.upsert({
    where: { deId_paraId: { deId: sessao.userId, paraId } },
    update: { gostou },
    create: { deId: sessao.userId, paraId, gostou },
  });

  if (!gostou) return Response.json({ match: false });

  // match so existe se a outra pessoa tambem curtiu
  const volta = await db.curtida.findUnique({
    where: { deId_paraId: { deId: paraId, paraId: sessao.userId } },
  });

  return Response.json({ match: volta?.gostou === true });
}
