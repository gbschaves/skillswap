import { db } from "@/lib/db";
import { criarSessao, hashSenha } from "@/lib/auth";

export async function POST(req: Request) {
  const { nome, email, senha, cidade } = await req.json();

  if (!nome || !email || !senha) {
    return Response.json({ erro: "Preencha nome, email e senha" }, { status: 400 });
  }
  if (senha.length < 6) {
    return Response.json({ erro: "A senha precisa ter pelo menos 6 caracteres" }, { status: 400 });
  }

  const emailLimpo = String(email).trim().toLowerCase();
  const existe = await db.user.findUnique({ where: { email: emailLimpo } });
  if (existe) {
    return Response.json({ erro: "Esse email ja esta cadastrado" }, { status: 409 });
  }

  const user = await db.user.create({
    data: {
      nome: String(nome).trim(),
      email: emailLimpo,
      senha: await hashSenha(senha),
      cidade: cidade ? String(cidade).trim() : null,
    },
  });

  await criarSessao(user.id);
  return Response.json({ id: user.id, nome: user.nome }, { status: 201 });
}
