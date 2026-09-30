const cena = document.getElementById("cena");
const personagem = document.getElementById("personagem");
const mensagemJogo = document.getElementById("mensagemJogo");

const btnIniciar = document.getElementById("btnIniciar");
const btnPausar = document.getElementById("btnPausar");
const btnReiniciar = document.getElementById("btnReiniciar");

let jogoAtivo = false;
let ultimoTempo = 0;
let proximoElemento = 0;
let elementos = [];

let personagemPulando = false;
let inicioPulo = 0;

const DURACAO_PULO = 650;
const ALTURA_PULO = 120;

function criarElemento() {
    const arvore = document.createElement("div");

    arvore.classList.add("arvore", "objeto-cenario");

    arvore.style.left = (100 + Math.random() * 30) + "%";

    const escala = 0.75 + Math.random() * 0.6;
    arvore.style.transform = `scale(${escala})`;

    cena.appendChild(arvore);
    elementos.push(arvore);
}

function atualizar(delta) {
    elementos.forEach(function(elemento) {
        const esquerda = parseFloat(elemento.style.left);

        elemento.style.left =
            (esquerda - delta * 0.04) + "%";
    });

    elementos = elementos.filter(function(elemento) {
        if (parseFloat(elemento.style.left) < -15) {
            elemento.remove();
            return false;
        }

        return true;
    });
}

function iniciarPulo() {
    if (!jogoAtivo || personagemPulando) return;

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

    const altura =
        Math.sin(progresso * Math.PI) * ALTURA_PULO;

    personagem.style.transform =
        `translateY(${-altura}px)`;
}

function verificarColisoes() {
    const areaPersonagem = personagem.getBoundingClientRect();

    for (const elemento of elementos) {
        const areaElemento = elemento.getBoundingClientRect();

        const colidiu =
            areaPersonagem.left < areaElemento.right &&
            areaPersonagem.right > areaElemento.left &&
            areaPersonagem.top < areaElemento.bottom &&
            areaPersonagem.bottom > areaElemento.top;

        if (colidiu) {
            jogoAtivo = false;

            personagem.classList.add("atingido");
            elemento.classList.add("obstaculo-atingido");
            mensagemJogo.classList.add("visivel");

            return true;
        }
    }

    return false;
}

function animar(tempo) {
    if (!jogoAtivo) return;

    const delta = tempo - ultimoTempo;
    ultimoTempo = tempo;

    proximoElemento -= delta;

    if (proximoElemento <= 0) {
        criarElemento();
        proximoElemento = 600 + Math.random() * 900;
    }

    atualizar(delta);
    atualizarPulo(tempo);

    if (!verificarColisoes()) {
        requestAnimationFrame(animar);
    }
}

function iniciarJogo() {
    if (jogoAtivo) return;

    jogoAtivo = true;
    ultimoTempo = performance.now();
    proximoElemento = 100;

    requestAnimationFrame(animar);
}

function pausarJogo() {
    jogoAtivo = false;
}

function reiniciarJogo() {
    jogoAtivo = false;

    elementos.forEach(function(elemento) {
        elemento.remove();
    });

    elementos = [];

    personagemPulando = false;
    inicioPulo = 0;

    personagem.classList.remove("atingido");
    mensagemJogo.classList.remove("visivel");
    
    personagem.style.transform = "translateY(0)";

    ultimoTempo = 0;
    proximoElemento = 0;
}

btnIniciar.addEventListener("click", iniciarJogo);
btnPausar.addEventListener("click", pausarJogo);
btnReiniciar.addEventListener("click", reiniciarJogo);

document.addEventListener("keydown", function(evento) {
    if (evento.code === "Space" || evento.code === "ArrowUp") {
        evento.preventDefault();
        iniciarPulo();
    }
});
