const cena = document.getElementById("cena");
const personagem = document.getElementById("personagem");
const mensagemJogo = document.getElementById("mensagemJogo");
const hudVidas = document.getElementById("hudVidas");
const hudPontos = document.getElementById("hudPontos");
const hudRecorde = document.getElementById("hudRecorde");
const statusJogo = document.getElementById("statusJogo");
const seletorJogador = document.getElementById("seletorJogador");
const statusJogador = document.getElementById("statusJogador");

const btnIniciar = document.getElementById("btnIniciar");
const btnPausar = document.getElementById("btnPausar");
const btnReiniciar = document.getElementById("btnReiniciar");

const VIDAS_INICIAIS = 3;
const DURACAO_PULO = 650;
const ALTURA_PULO = 120;
const VELOCIDADE_CENARIO = 0.04;
const INTERVALO_MINIMO = 600;
const INTERVALO_VARIAVEL = 900;

let jogoAtivo = false;
let jogoEncerrado = false;
let ultimoTempo = 0;
let tempoProximoObstaculo = 100;
let elementos = [];
let vidas = VIDAS_INICIAIS;
let pontos = 0;
let jogadorAtual = JogadoresStore.garantirJogadorInicial();
let recorde = jogadorAtual.pontuacao;
let personagemPulando = false;
let inicioPulo = 0;

preencherSeletorJogadores();

function carregarRecorde() {
    const jogador = JogadoresStore.buscarPorId(JogadoresStore.obterJogadorAtivoId());
    return jogador ? jogador.pontuacao : 0;
}

function salvarRecorde() {
    if (!jogadorAtual || pontos <= recorde) return;
    const jogadorSalvo = JogadoresStore.salvarMelhorPontuacao(jogadorAtual.id, pontos);
    if (jogadorSalvo) {
        jogadorAtual = jogadorSalvo;
        recorde = jogadorAtual.pontuacao;
    }
}

function aplicarJogador(jogador) {
    jogadorAtual = jogador;
    recorde = jogador ? jogador.pontuacao : 0;
    if (jogador) {
        personagem.style.setProperty("--cor-personagem", jogador.cor);
        statusJogador.textContent = `Jogando como ${jogador.nome}. Melhor pontuação: ${jogador.pontuacao}.`;
        hudRecorde.textContent = `🏆 Recorde: ${recorde}`;
    } else {
        personagem.style.removeProperty("--cor-personagem");
        statusJogador.textContent = "Cadastre um jogador para começar.";
    }
    btnIniciar.disabled = !jogador;
    atualizarPainel();
}

function preencherSeletorJogadores() {
    const jogadores = JogadoresStore.listar();
    const ativoId = JogadoresStore.obterJogadorAtivoId();
    seletorJogador.replaceChildren();
    jogadores.forEach(function (jogador) {
        const opcao = document.createElement("option");
        opcao.value = jogador.id;
        opcao.textContent = jogador.nome;
        seletorJogador.appendChild(opcao);
    });
    if (jogadores.length === 0) {
        const opcao = document.createElement("option");
        opcao.value = "";
        opcao.textContent = "Nenhum jogador cadastrado";
        seletorJogador.appendChild(opcao);
        seletorJogador.disabled = true;
        aplicarJogador(null);
        return;
    }
    seletorJogador.disabled = false;
    const selecionado = jogadores.find(function (jogador) { return jogador.id === ativoId; }) || jogadores[0];
    seletorJogador.value = selecionado.id;
    JogadoresStore.definirJogadorAtivo(selecionado.id);
    aplicarJogador(selecionado);
}

function atualizarPainel() {
    hudVidas.textContent = `${"❤️".repeat(vidas)}${vidas ? " " : " "}Vidas: ${vidas}`;
    hudPontos.textContent = `⭐ Pontos: ${pontos}`;
    hudRecorde.textContent = `🏆 Recorde: ${recorde}`;
}

function criarObstaculo() {
    const obstaculo = document.createElement("div");
    obstaculo.classList.add("arvore", "objeto-cenario");
    obstaculo.style.left = `${100 + Math.random() * 30}%`;
    const escala = 0.75 + Math.random() * 0.6;
    obstaculo.style.transform = `scale(${escala})`;
    obstaculo.dataset.resolvido = "false";
    obstaculo.dataset.pontuado = "false";
    cena.appendChild(obstaculo);
    elementos.push(obstaculo);
}

function atualizarObstaculos(delta) {
    elementos.forEach(function(elemento) {
        const esquerda = parseFloat(elemento.style.left);
        elemento.style.left = `${esquerda - delta * VELOCIDADE_CENARIO}%`;
    });

    elementos = elementos.filter(function(elemento) {
        const esquerda = parseFloat(elemento.style.left);

        if (esquerda < -15) {
            elemento.remove();
            return false;
        }

        // O ponto é concedido quando o obstáculo passa pelo personagem.
        const limiteDireito = esquerda + elemento.getBoundingClientRect().width / cena.getBoundingClientRect().width * 100;
        if (elemento.dataset.resolvido !== "true" &&
            elemento.dataset.pontuado !== "true" &&
            limiteDireito < 16) {
            pontos += 1;
            elemento.dataset.pontuado = "true";
            salvarRecorde();
            atualizarPainel();
        }
        return true;
    });
}

function iniciarPulo() {
    if (!jogoAtivo || personagemPulando || jogoEncerrado) return;
    personagemPulando = true;
    inicioPulo = performance.now();
}

function atualizarPulo(tempo) {
    if (!personagemPulando) return;

    const tempoPulo = tempo - inicioPulo;
    const progresso = tempoPulo / DURACAO_PULO;

    if (progresso >= 1) {
        personagemPulando = false;
        personagem.style.transform = "translateY(0)";
        return;
    }

    const altura = Math.sin(progresso * Math.PI) * ALTURA_PULO;
    personagem.style.transform = `translateY(${-altura}px)`;
}

function verificarColisoes() {
    const areaPersonagem = personagem.getBoundingClientRect();

    for (const elemento of elementos) {
        if (elemento.dataset.resolvido === "true") continue;

        const areaElemento = elemento.getBoundingClientRect();
        const colidiu =
            areaPersonagem.left < areaElemento.right &&
            areaPersonagem.right > areaElemento.left &&
            areaPersonagem.top < areaElemento.bottom &&
            areaPersonagem.bottom > areaElemento.top;

        if (colidiu) {
            // Marca e remove o obstáculo para impedir várias perdas de vida
            // pela mesma colisão em quadros consecutivos da animação.
            elemento.dataset.resolvido = "true";
            elemento.classList.add("obstaculo-atingido");
            elemento.remove();
            elementos = elementos.filter(item => item !== elemento);

            vidas -= 1;
            personagem.classList.add("atingido");
            window.setTimeout(() => personagem.classList.remove("atingido"), 180);
            atualizarPainel();

            if (vidas <= 0) {
                encerrarJogo();
            } else {
                statusJogo.textContent = `Colisão! Você perdeu uma vida. Restam ${vidas}. Continue pulando os obstáculos.`;
            }
            return true;
        }
    }
    return false;
}

function encerrarJogo() {
    jogoAtivo = false;
    jogoEncerrado = true;
    salvarRecorde();
    atualizarPainel();
    mensagemJogo.textContent = `FIM DE JOGO — Pontuação: ${pontos}`;
    mensagemJogo.classList.add("visivel");
    statusJogo.textContent = "Suas vidas acabaram. Clique em Reiniciar para jogar novamente.";
}

function animar(tempo) {
    if (!jogoAtivo || jogoEncerrado) return;

    const delta = tempo - ultimoTempo;
    ultimoTempo = tempo;
    tempoProximoObstaculo -= delta;

    if (tempoProximoObstaculo <= 0) {
        criarObstaculo();
        tempoProximoObstaculo = INTERVALO_MINIMO + Math.random() * INTERVALO_VARIAVEL;
    }

    atualizarObstaculos(delta);
    atualizarPulo(tempo);

    verificarColisoes();

    // Uma colisão não encerra a partida enquanto ainda houver vidas.
    // O loop só para quando o jogo é pausado ou chega ao fim.
    if (jogoAtivo) {
        requestAnimationFrame(animar);
    }
}

function iniciarJogo() {
    if (jogoAtivo || jogoEncerrado) return;
    jogoAtivo = true;
    personagem.classList.remove("atingido");
    mensagemJogo.classList.remove("visivel");
    ultimoTempo = performance.now();
    statusJogo.textContent = "Jogo em andamento. Pressione Espaço ou ↑ para pular.";
    requestAnimationFrame(animar);
}

function pausarJogo() {
    if (!jogoAtivo) return;
    jogoAtivo = false;
    statusJogo.textContent = "Jogo pausado. Clique em Iniciar para continuar.";
}

function reiniciarJogo() {
    jogoAtivo = false;
    jogoEncerrado = false;

    elementos.forEach(elemento => elemento.remove());
    elementos = [];

    vidas = VIDAS_INICIAIS;
    pontos = 0;
    personagemPulando = false;
    inicioPulo = 0;
    ultimoTempo = 0;
    tempoProximoObstaculo = 100;

    personagem.classList.remove("atingido");
    personagem.style.transform = "translateY(0)";
    mensagemJogo.textContent = "FIM DE JOGO";
    mensagemJogo.classList.remove("visivel");

    atualizarPainel();
    statusJogo.textContent = "Partida reiniciada. Clique em Iniciar para começar.";
}

seletorJogador.addEventListener("change", function () {
    if (jogoAtivo) {
        seletorJogador.value = jogadorAtual ? jogadorAtual.id : "";
        statusJogador.textContent = "Pause o jogo antes de trocar de jogador.";
        return;
    }
    const jogador = JogadoresStore.buscarPorId(seletorJogador.value);
    if (!jogador) return;
    JogadoresStore.definirJogadorAtivo(jogador.id);
    aplicarJogador(jogador);
    reiniciarJogo();
    statusJogador.textContent = `Jogando como ${jogador.nome}. Melhor pontuação: ${jogador.pontuacao}.`;
});

btnIniciar.addEventListener("click", iniciarJogo);
btnPausar.addEventListener("click", pausarJogo);
btnReiniciar.addEventListener("click", reiniciarJogo);

document.addEventListener("keydown", function(evento) {
    if ((evento.code === "Space" || evento.code === "ArrowUp") && jogadorAtual) {
        evento.preventDefault();
        iniciarPulo();
    }
});
