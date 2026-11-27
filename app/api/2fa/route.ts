import { authenticator } from "otplib";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { pegarSessao } from "@/lib/auth";

export async function GET() {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessao.userId } });
  return Response.json({ ativo: !!user?.totpSecret });
}

// sem codigo: gera um segredo novo e o qr code
// com codigo: confere e liga o 2fa
export async function POST(req: Request) {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessao.userId } });
  if (!user) return Response.json({ erro: "Usuario nao encontrado" }, { status: 404 });

  const { segredo, codigo } = await req.json();

  if (!codigo) {
    const novo = authenticator.generateSecret();
    const qr = await QRCode.toDataURL(authenticator.keyuri(user.email, "SkillSwap", novo));
    return Response.json({ segredo: novo, qr });
  }

  if (!segredo || !authenticator.check(String(codigo), segredo)) {
    return Response.json({ erro: "Codigo invalido" }, { status: 400 });
  }

  await db.user.update({ where: { id: user.id }, data: { totpSecret: segredo } });
  return Response.json({ ativo: true });
}

export async function DELETE(req: Request) {
  const sessao = await pegarSessao();
  if (!sessao) return Response.json({ erro: "Nao autenticado" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessao.userId } });
  const { codigo } = await req.json();

  if (!user?.totpSecret || !authenticator.check(String(codigo), user.totpSecret)) {
    return Response.json({ erro: "Codigo invalido" }, { status: 400 });
  }

  await db.user.update({ where: { id: user.id }, data: { totpSecret: null } });
  return Response.json({ ativo: false });
}
