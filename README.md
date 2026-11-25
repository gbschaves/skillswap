# SkillSwap

Projeto da disciplina com o tema **Do virtual ao presencial**.

A ideia é um "Tinder de skills": cada pessoa cadastra o que sabe ensinar e o que quer aprender. O app encontra quem combina com você, mas a troca acontece pessoalmente, num encontro marcado pelo próprio sistema.

## Tecnologias

- Next.js 16 (App Router) + TypeScript + Tailwind
- Prisma com SQLite (desenvolvimento) e Postgres (produção)
- Autenticação própria: senha com bcrypt e sessão em JWT num cookie httpOnly
- `proxy.ts` bloqueia as páginas privadas para quem não está logado

## Como rodar

```bash
npm install
cp .env.example .env      # e preencha o AUTH_SECRET
npx prisma db push        # cria o banco local
npm run dev
```

Abra http://localhost:3000

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| POST | `/api/cadastro` | cria a conta e já loga |
| POST | `/api/login` | entra com email e senha |
| POST | `/api/logout` | apaga o cookie de sessão |
| GET | `/api/perfil` | dados do usuário logado |
| PUT | `/api/perfil` | edita nome, cidade, bio e skills |
