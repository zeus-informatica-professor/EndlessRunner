# Fábrica Endless Runner — versão 0.2

Portal educacional de Programação Web com uma trilha progressiva de 11 etapas.

## Como executar
1. Extraia o ZIP.
2. Abra a pasta `endless-final`.
3. Abra `index.html` no navegador ou use Live Server no VS Code.
4. Acesse as etapas pela navegação do portal.

## O que esta versão contém
- Página inicial do portal com trilha de 11 etapas.
- Etapas 01 a 10 preservadas a partir da versão mais recente disponível do projeto.
- Etapa 11 com jogo integrado: movimento dos obstáculos, pulo, colisão, vidas, pontuação, recorde local, fim de jogo e reinício.
- Espaços reservados para publicidade, sem identificadores fictícios e sem código ativo de AdSense.
- Páginas iniciais “Sobre” e “Política de privacidade”.
- Arquivo `ads.txt` de placeholder para completar quando os dados oficiais do AdSense estiverem disponíveis.

## Mecânicas do jogo completo
- Pressione `Espaço` ou `↑` para pular.
- Clique em Iniciar para começar, Pausar para interromper e Reiniciar para começar uma nova partida.
- Cada obstáculo ultrapassado acrescenta 1 ponto.
- Uma colisão remove um obstáculo e reduz uma vida; o mesmo obstáculo não pode descontar várias vidas.
- Com zero vidas, o jogo termina.
- O recorde fica salvo no `localStorage` do navegador com a chave `endlessRunnerRecorde`.

## Organização
- `index.html`: página inicial.
- `01-ceu.html` a `11-jogo.html`: sequência didática.
- `css/style.css`: estilos compartilhados.
- `js/`: comportamento das etapas.
- `politica-de-privacidade.html` e `sobre.html`: páginas informativas.
- `ads.txt`: placeholder para configuração futura.

## Publicidade
Os blocos atuais são apenas espaços reservados. Antes de publicar:
1. Confirmar domínio e implantação.
2. Configurar o AdSense com as credenciais reais fornecidas pela conta.
3. Inserir o snippet oficial do AdSense no `<head>` conforme as instruções da plataforma.
4. Substituir `ads.txt` pelo conteúdo oficial.
5. Revisar a política de privacidade de acordo com os serviços realmente ativados.

Nenhuma credencial, ID de editor ou código de anúncio foi inventado.


## Etapas atualizadas
- Etapa 11: `11-tratamento-erros.html` — `try`, `catch`, `finally` e `throw`.
- Etapa 12: `12-jogo.html` — versão integrada do jogo Endless Runner.

Os espaços de anúncio e `ads.txt` são placeholders; não há anúncios ativos. Consulte o guia de AdSense fornecido separadamente.
