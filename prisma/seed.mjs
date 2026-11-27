import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const pessoas = [
  { nome: "Ana Souza", email: "ana@teste.com", cidade: "São Paulo", ensina: ["violão", "inglês"], aprende: ["programação"] },
  { nome: "Bruno Lima", email: "bruno@teste.com", cidade: "São Paulo", ensina: ["programação", "xadrez"], aprende: ["violão"] },
  { nome: "Carla Mendes", email: "carla@teste.com", cidade: "Campinas", ensina: ["culinária"], aprende: ["inglês", "xadrez"] },
  { nome: "Diego Rocha", email: "diego@teste.com", cidade: "São Paulo", ensina: ["fotografia"], aprende: ["culinária"] },
  { nome: "Elisa Martins", email: "elisa@teste.com", cidade: "Santos", ensina: ["inglês", "fotografia"], aprende: ["violão"] },
  { nome: "Gabriel Costa", email: "gabriel@teste.com", cidade: "Campinas", ensina: ["pandeiro", "percussão"], aprende: ["programação"] },
  { nome: "Kaique Ferreira", email: "kaique@teste.com", cidade: "Guarulhos", ensina: ["pandeiro", "cavaquinho"], aprende: ["inglês"] },
  { nome: "Fernanda Alves", email: "fernanda@teste.com", cidade: "São Paulo", ensina: ["inglês", "pandeiro"], aprende: ["violão"] },
  { nome: "Otávio Moreira", email: "otavio@teste.com", cidade: "São Paulo", ensina: ["espanhol"], aprende: ["pandeiro", "violão"] },
];

async function main() {
  const senha = await bcrypt.hash("123456", 10);

  for (const p of pessoas) {
    await prisma.user.deleteMany({ where: { email: p.email } });
    const user = await prisma.user.create({
      data: { nome: p.nome, email: p.email, cidade: p.cidade, senha },
    });

    const lista = [
      ...p.ensina.map((nome) => ({ nome, tipo: "ensina" })),
      ...p.aprende.map((nome) => ({ nome, tipo: "aprende" })),
    ];
    for (const s of lista) {
      const skill = await prisma.skill.upsert({
        where: { nome: s.nome },
        update: {},
        create: { nome: s.nome },
      });
      await prisma.userSkill.create({
        data: { tipo: s.tipo, userId: user.id, skillId: skill.id },
      });
    }
  }

  console.log("seed ok, senha de todos: 123456");
}

main().finally(() => prisma.$disconnect());
