import { db } from "@/lib/db";
import { conferirSenha, criarSessao } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, senha } = await req.json();

  if (!email || !senha) {
    return Response.json({ erro: "Informe email e senha" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });

  // mesma mensagem nos dois casos pra nao entregar quais emails existem
  if (!user || !(await conferirSenha(senha, user.senha))) {
    return Response.json({ erro: "Email ou senha incorretos" }, { status: 401 });
  }

  await criarSessao(user.id);
  return Response.json({ id: user.id, nome: user.nome });
}
