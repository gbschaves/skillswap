import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const chave = new TextEncoder().encode(process.env.AUTH_SECRET);
const SETE_DIAS = 7 * 24 * 60 * 60 * 1000;

export function hashSenha(senha: string) {
  return bcrypt.hash(senha, 10);
}

export function conferirSenha(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}

export async function lerToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave);
    return payload as { userId: number };
  } catch {
    return null;
  }
}

export async function criarSessao(userId: number) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(chave);

  const cookieStore = await cookies();
  cookieStore.set("sessao", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SETE_DIAS),
  });
}

export async function pegarSessao() {
  const cookieStore = await cookies();
  return lerToken(cookieStore.get("sessao")?.value);
}

export async function apagarSessao() {
  const cookieStore = await cookies();
  cookieStore.delete("sessao");
}
