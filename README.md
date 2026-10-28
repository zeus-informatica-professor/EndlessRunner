# Fábrica Endless Runner — versão 0.4 (CRUD de jogadores)

Portal didático de Programação Web com 13 etapas, jogo integrado e CRUD de jogadores.

## Como executar
1. Extraia o ZIP.
2. Abra a pasta `endless-final`.
3. Abra `index.html` no navegador ou, de preferência, use Live Server no VS Code.
4. Acesse a etapa 13 para cadastrar, editar e excluir jogadores; depois abra a etapa 12 para jogar.

## Novidades da versão 0.4
- Etapa 13: CRUD de jogadores (Create, Read, Update e Delete).
- Cada jogador é um objeto com `id`, `nome`, `pontuacao`, `cor`, `criadoEm` e `atualizadoEm`.
- O cadastro valida nome, pontuação inteira não negativa e cor hexadecimal.
- A página de jogo permite escolher o jogador ativo.
- A cor cadastrada é aplicada ao corpo do personagem jogável.
- A pontuação máxima é persistida no cadastro do jogador quando um novo recorde é alcançado.
- O armazenamento é feito em `localStorage`; os dados não sincronizam entre dispositivos.
- A estrutura dos objetos foi preparada para futura migração a uma tabela PostgreSQL no Supabase.
- O script global do Google AdSense foi incluído em todas as páginas HTML com o ID de editor fornecido pelo professor, permitindo a configuração de anúncios automáticos. Os anúncios só serão exibidos se o site/conta estiverem aprovados e a configuração do AdSense permitir.

## Mecânicas do jogo
- Pressione `Espaço` ou `↑` para pular.
- Use Iniciar, Pausar e Reiniciar.
- Cada obstáculo ultrapassado acrescenta 1 ponto.
- Uma colisão remove um obstáculo e reduz uma vida.
- O recorde exibido é específico do jogador selecionado.

## Organização relevante
- `index.html`: página inicial e trilha.
- `01-ceu.html` a `13-jogadores.html`: etapas didáticas e CRUD.
- `12-jogo.html`: jogo integrado.
- `css/style.css`: estilos compartilhados.
- `js/jogadores-dados.js`: operações de leitura e gravação dos objetos no localStorage.
- `js/jogadores-crud.js`: lógica da interface CRUD.
- `js/jogo-completo.js`: mecânicas do jogo e associação ao jogador ativo.
- `politica-de-privacidade.html`: política-modelo que deve ser revisada antes de monetizar/publicar definitivamente.

## Modelo de dados atual
```js
{
  id: "uuid",
  nome: "Ana Silva",
  pontuacao: 25,
  cor: "#1976d2",
  criadoEm: "2026-10-23T12:00:00.000Z",
  atualizadoEm: "2026-10-23T12:00:00.000Z"
}
```

## Caminho didático para as próximas aulas
1. Definir a tabela PostgreSQL `jogadores` e seus tipos/constraints.
2. Criar a tabela no Supabase.
3. Entender API REST e `fetch()`.
4. Trocar o armazenamento local por operações remotas, sem colocar chaves secretas no frontend.
5. Validar erros de rede, respostas HTTP e regras de negócio.

## Publicidade
O script global incluído é o de anúncios automáticos do AdSense. Ele não garante anúncios visíveis enquanto o site estiver em revisão ou não aprovado. Não foram inventados IDs de blocos (`data-ad-slot`).
