import { db } from "@/lib/db";

// match = os dois se curtiram
export async function temMatch(a: number, b: number) {
  const curtidas = await db.curtida.findMany({
    where: {
      gostou: true,
      OR: [
        { deId: a, paraId: b },
        { deId: b, paraId: a },
      ],
    },
  });
  return curtidas.length === 2;
}
