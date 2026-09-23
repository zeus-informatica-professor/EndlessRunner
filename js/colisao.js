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
        elemento.style.left = (esquerda - delta * 0.04) + "%";
    });

    elementos = elementos.filter(function(elemento) {
        if (parseFloat(elemento.style.left) < -15) {
            elemento.remove();
            return false;
        }

        return true;
    });
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
    personagem.classList.remove("atingido");
    mensagemJogo.classList.remove("visivel");
    ultimoTempo = 0;
    proximoElemento = 0;
}

btnIniciar.addEventListener("click", iniciarJogo);
btnPausar.addEventListener("click", pausarJogo);
btnReiniciar.addEventListener("click", reiniciarJogo);
