(function () {
"use strict";
const $ = id => document.getElementById(id);
const cena=$("cenaSupabase"), personagem=$("personagemSupabase"), mensagemJogo=$("mensagemJogoSupabase");
const hudVidas=$("hudVidasSupabase"), hudPontos=$("hudPontosSupabase"), hudRecorde=$("hudRecordeSupabase"), statusJogo=$("statusJogoSupabase");
const seletor=$("seletorJogadorSupabase"), statusJogador=$("statusJogadorSupabase");
const btnIniciar=$("btnIniciarSupabase"), btnPausar=$("btnPausarSupabase"), btnReiniciar=$("btnReiniciarSupabase");
const campoUrl=$("supabaseUrlJogo"), campoChave=$("supabaseKeyJogo"), statusConexao=$("statusConexaoJogo");
const VIDAS_INICIAIS=3, DURACAO_PULO=650, ALTURA_PULO=120, VELOCIDADE_CENARIO=0.04, INTERVALO_MINIMO=600, INTERVALO_VARIAVEL=900;
let cliente=null, jogadores=[], jogadorAtual=null, jogoAtivo=false, jogoEncerrado=false, ultimoTempo=0, tempoProximoObstaculo=100;
let elementos=[], vidas=VIDAS_INICIAIS, pontos=0, recorde=0, personagemPulando=false, inicioPulo=0, salvandoRecorde=false;
const config=window.SUPABASE_CONFIG||{};
if(config.url && !config.url.startsWith("COLE_AQUI_")) campoUrl.value=config.url;
if(config.anonKey && !config.anonKey.startsWith("COLE_AQUI_")) campoChave.value=config.anonKey;
function status(el,texto,tipo="info"){el.textContent=texto;el.dataset.tipo=tipo;}
function atualizarPainel(){hudVidas.textContent=`${"❤️".repeat(vidas)} Vidas: ${vidas}`;hudPontos.textContent=`⭐ Pontos: ${pontos}`;hudRecorde.textContent=`🏆 Recorde: ${recorde}`;}
function habilitarControles(habilitado){btnIniciar.disabled=!habilitado;btnPausar.disabled=!habilitado;btnReiniciar.disabled=!habilitado;}
async function carregarJogadores(){
 if(!cliente){status(statusConexao,"Conecte-se antes de consultar.","erro");return;}
 status(statusConexao,"Consultando public.jogadores... ");
 const {data,error}=await cliente.from("jogadores").select("id,nome,pontuacao,cor").order("pontuacao",{ascending:false}).order("nome",{ascending:true});
 if(error){console.error(error);status(statusConexao,"Falha ao consultar: "+error.message,"erro");return;}
 jogadores=data||[];const idAnterior=jogadorAtual?String(jogadorAtual.id):seletor.value;
 seletor.replaceChildren();
 jogadores.forEach(j=>{const op=document.createElement("option");op.value=String(j.id);op.textContent=`${j.nome} — recorde: ${j.pontuacao}`;seletor.appendChild(op);});
 if(!jogadores.length){const op=document.createElement("option");op.value="";op.textContent="Nenhum jogador cadastrado";seletor.appendChild(op);seletor.disabled=true;jogadorAtual=null;status(statusJogador,"Cadastre um jogador na etapa 14.","erro");habilitarControles(false);status(statusConexao,"Conectado, mas nenhum jogador foi encontrado.","sucesso");return;}
 seletor.disabled=false;const escolhido=jogadores.find(j=>String(j.id)===idAnterior)||jogadores[0];seletor.value=String(escolhido.id);aplicarJogador(escolhido);
 status(statusConexao,`${jogadores.length} jogador(es) carregado(s) do PostgreSQL.`,"sucesso");
}
function aplicarJogador(j){jogadorAtual=j;recorde=Number(j.pontuacao)||0;personagem.style.setProperty("--cor-personagem",j.cor||"#22c55e");status(statusJogador,`Jogando como ${j.nome}. Recorde no banco: ${recorde}.`,"sucesso");habilitarControles(true);atualizarPainel();}
async function salvarRecorde(){
 if(!cliente||!jogadorAtual||pontos<=recorde||salvandoRecorde)return;
 salvandoRecorde=true;const id=jogadorAtual.id, novaPontuacao=pontos;
 status(statusJogador,`Novo recorde (${novaPontuacao})! Salvando no PostgreSQL...`,"info");
 try{
  // A condição .lt evita substituir um recorde maior gravado por outra sessão.
  const {data,error}=await cliente.from("jogadores").update({pontuacao:novaPontuacao}).eq("id",id).lt("pontuacao",novaPontuacao).select("id,nome,pontuacao,cor");
  if(error)throw error;
  if(data&&data.length){jogadorAtual=data[0];recorde=Number(jogadorAtual.pontuacao);status(statusJogador,`Recorde ${recorde} salvo no PostgreSQL.`,"sucesso");}
  else {
   const {data:atual,error:erroConsulta}=await cliente.from("jogadores").select("id,nome,pontuacao,cor").eq("id",id).single();
   if(erroConsulta)throw erroConsulta;
   jogadorAtual=atual;recorde=Number(atual.pontuacao)||0;
   status(statusJogador,recorde>=novaPontuacao?`Recorde no banco: ${recorde}. Outra sessão pode ter atualizado primeiro.`:"A pontuação não foi atualizada. Confira as permissões UPDATE/RLS.","info");
  }
  atualizarPainel();
 }catch(e){console.error(e);status(statusJogador,"Não foi possível salvar o recorde: "+e.message,"erro");}
 finally{salvandoRecorde=false;}
}
function criarObstaculo(){const o=document.createElement("div");o.classList.add("arvore","objeto-cenario");o.style.left=`${100+Math.random()*30}%`;o.style.transform=`scale(${0.75+Math.random()*0.6})`;o.dataset.resolvido="false";o.dataset.pontuado="false";cena.appendChild(o);elementos.push(o);}
function atualizarObstaculos(delta){elementos.forEach(o=>o.style.left=`${parseFloat(o.style.left)-delta*VELOCIDADE_CENARIO}%`);elementos=elementos.filter(o=>{const esquerda=parseFloat(o.style.left);if(esquerda < -15){o.remove();return false;}const limite=esquerda+o.getBoundingClientRect().width/cena.getBoundingClientRect().width*100;if(o.dataset.resolvido!=="true"&&o.dataset.pontuado!=="true"&&limite<16){pontos++;o.dataset.pontuado="true";atualizarPainel();if(pontos>recorde)salvarRecorde();}return true;});}
function iniciarPulo(){if(!jogoAtivo||personagemPulando||jogoEncerrado)return;personagemPulando=true;inicioPulo=performance.now();}
function atualizarPulo(tempo){if(!personagemPulando)return;const progresso=(tempo-inicioPulo)/DURACAO_PULO;if(progresso>=1){personagemPulando=false;personagem.style.transform="translateY(0)";return;}personagem.style.transform=`translateY(${-Math.sin(progresso*Math.PI)*ALTURA_PULO}px)`;}
function verificarColisoes(){const p=personagem.getBoundingClientRect();for(const o of elementos){if(o.dataset.resolvido==="true")continue;const r=o.getBoundingClientRect();if(p.left<r.right&&p.right>r.left&&p.top<r.bottom&&p.bottom>r.top){o.dataset.resolvido="true";o.remove();elementos=elementos.filter(x=>x!==o);vidas--;personagem.classList.add("atingido");setTimeout(()=>personagem.classList.remove("atingido"),180);atualizarPainel();if(vidas<=0)encerrarJogo();else status(statusJogo,`Colisão! Restam ${vidas} vidas.`);return true;}}return false;}
function encerrarJogo(){jogoAtivo=false;jogoEncerrado=true;if(pontos>recorde)salvarRecorde();atualizarPainel();mensagemJogo.textContent=`FIM DE JOGO — Pontuação: ${pontos}`;mensagemJogo.classList.add("visivel");status(statusJogo,"Suas vidas acabaram. Clique em Reiniciar para jogar novamente.");}
function animar(tempo){if(!jogoAtivo||jogoEncerrado)return;const delta=tempo-ultimoTempo;ultimoTempo=tempo;tempoProximoObstaculo-=delta;if(tempoProximoObstaculo<=0){criarObstaculo();tempoProximoObstaculo=INTERVALO_MINIMO+Math.random()*INTERVALO_VARIAVEL;}atualizarObstaculos(delta);atualizarPulo(tempo);verificarColisoes();if(jogoAtivo)requestAnimationFrame(animar);}
function iniciarJogo(){if(!jogadorAtual||jogoAtivo||jogoEncerrado)return;jogoAtivo=true;personagem.classList.remove("atingido");mensagemJogo.classList.remove("visivel");ultimoTempo=performance.now();status(statusJogo,"Jogo em andamento. Espaço ou ↑ para pular.");requestAnimationFrame(animar);}
function pausarJogo(){if(!jogoAtivo)return;jogoAtivo=false;status(statusJogo,"Jogo pausado. Clique em Iniciar para continuar.");}
function reiniciarJogo(){jogoAtivo=false;jogoEncerrado=false;elementos.forEach(o=>o.remove());elementos=[];vidas=VIDAS_INICIAIS;pontos=0;personagemPulando=false;inicioPulo=0;ultimoTempo=0;tempoProximoObstaculo=100;personagem.classList.remove("atingido");personagem.style.transform="translateY(0)";mensagemJogo.classList.remove("visivel");atualizarPainel();status(statusJogo,"Partida reiniciada. Clique em Iniciar para começar.");}
async function conectar(){const url=campoUrl.value.trim(),key=campoChave.value.trim();if(!url.startsWith("https://")||!key){status(statusConexao,"Informe uma Project URL e uma chave pública válidas.","erro");return;}if(!window.supabase){status(statusConexao,"Biblioteca Supabase não carregada. Verifique a internet.","erro");return;}try{cliente=window.supabase.createClient(url,key);await carregarJogadores();}catch(e){cliente=null;status(statusConexao,"Erro ao conectar: "+e.message,"erro");}}
$("btnConectarJogo").addEventListener("click",conectar);
$("btnDesconectarJogo").addEventListener("click",()=>{pausarJogo();cliente=null;jogadores=[];jogadorAtual=null;seletor.replaceChildren();const op=document.createElement("option");op.value="";op.textContent="Conecte-se para carregar";seletor.appendChild(op);seletor.disabled=true;habilitarControles(false);personagem.style.removeProperty("--cor-personagem");status(statusConexao,"Desconectado.","info");status(statusJogador,"Conecte-se ao Supabase para selecionar um jogador.");mensagemJogo.textContent="CONECTE-SE AO SUPABASE";mensagemJogo.classList.add("visivel");});
$("btnAtualizarJogadores").addEventListener("click",carregarJogadores);
seletor.addEventListener("change",()=>{if(jogoAtivo){seletor.value=String(jogadorAtual.id);status(statusJogador,"Pause o jogo antes de trocar de jogador.","info");return;}const j=jogadores.find(x=>String(x.id)===seletor.value);if(j){aplicarJogador(j);reiniciarJogo();}});
btnIniciar.addEventListener("click",iniciarJogo);btnPausar.addEventListener("click",pausarJogo);btnReiniciar.addEventListener("click",reiniciarJogo);
document.addEventListener("keydown",e=>{if((e.code==="Space"||e.code==="ArrowUp")&&jogadorAtual){e.preventDefault();iniciarPulo();}});
})();
