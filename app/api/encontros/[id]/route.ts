import { db } from "@/lib/db";
import { pegarSessao } from "@/lib/auth";

// so quem foi convidado pode aceitar
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const { id } = await params;
  const encontro = await db.encontro.findUnique({ where: { id: Number(id) } });

  if (!encontro || encontro.convidadoId !== sessao.userId) {
    return Response.json({ erro: "Encontro nao encontrado" }, { status: 404 });
  }
  if (encontro.status !== "proposto") {
    return Response.json({ erro: "Esse encontro ja foi aceito" }, { status: 400 });
  }

  const atualizado = await db.encontro.update({
    where: { id: encontro.id },
    data: { status: "aceito" },
  });
  return Response.json(atualizado);
}
