import { db } from "@/lib/db";
import { pegarSessao } from "@/lib/auth";

// quem foi convidado digita o codigo do QR que aparece no celular de quem marcou
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const codigo = String(body.codigo ?? "").trim().toUpperCase();

  const encontro = await db.encontro.findUnique({ where: { id: Number(id) } });
  if (!encontro || encontro.convidadoId !== sessao.userId) {
    return Response.json({ erro: "Encontro nao encontrado" }, { status: 404 });
  }
  if (encontro.status !== "aceito") {
    return Response.json({ erro: "O encontro precisa estar aceito" }, { status: 400 });
  }
  if (codigo !== encontro.codigo) {
    return Response.json({ erro: "Codigo errado" }, { status: 400 });
  }

  const atualizado = await db.encontro.update({
    where: { id: encontro.id },
    data: { status: "realizado" },
  });
  return Response.json(atualizado);
}
