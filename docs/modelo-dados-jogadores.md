# Modelo de dados — Jogadores do Endless Runner

## Objeto JavaScript atual

```js
{
  id: "UUID",
  nome: "Ana Silva",
  pontuacao: 25,
  cor: "#1976d2",
  criadoEm: "2026-10-23T12:00:00.000Z",
  atualizadoEm: "2026-10-23T12:00:00.000Z"
}
```

- `id`: identificador estável, não depende do nome.
- `nome`: texto de 2 a 40 caracteres.
- `pontuacao`: melhor pontuação inteira, maior ou igual a zero.
- `cor`: código hexadecimal de seis dígitos, aplicado ao personagem.
- `criadoEm` e `atualizadoEm`: datas em formato ISO 8601.

## Persistência nesta versão

O array de objetos é serializado em JSON e armazenado no `localStorage` sob a chave `ficEndlessJogadoresV1`. O identificador do jogador selecionado é armazenado em `ficEndlessJogadorAtivoV1`. Isso é armazenamento local por navegador, não uma base de dados compartilhada.

## Mapeamento futuro para PostgreSQL / Supabase

| JavaScript | Coluna sugerida | Tipo PostgreSQL |
|---|---|---|
| `id` | `id` | `uuid primary key` |
| `nome` | `nome` | `text not null` |
| `pontuacao` | `pontuacao` | `integer not null default 0` |
| `cor` | `cor` | `varchar(7) not null` |
| `criadoEm` | `criado_em` | `timestamptz not null default now()` |
| `atualizadoEm` | `atualizado_em` | `timestamptz not null default now()` |

Na futura integração, as operações CRUD serão realizadas por chamadas HTTP à API do Supabase. As políticas de acesso (RLS), validação e permissões devem ser configuradas antes de disponibilizar gravações públicas. Nunca coloque `service_role` ou outra chave secreta no JavaScript enviado ao navegador.
