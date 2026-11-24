import { NextRequest, NextResponse } from "next/server";
import { lerToken } from "@/lib/auth";

const rotasPrivadas = ["/perfil", "/explorar", "/matches", "/encontros"];
const rotasDeEntrada = ["/login", "/cadastro"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const sessao = await lerToken(req.cookies.get("sessao")?.value);

  const privada = rotasPrivadas.some((r) => path.startsWith(r));
  if (privada && !sessao) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // quem ja esta logado nao precisa ver login/cadastro
  if (rotasDeEntrada.includes(path) && sessao) {
    return NextResponse.redirect(new URL("/perfil", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
