import { apagarSessao } from "@/lib/auth";

export async function POST() {
  await apagarSessao();
  return Response.json({ ok: true });
}
