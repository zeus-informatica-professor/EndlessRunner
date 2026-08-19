// ======================================================
// ENDLESS RUNNER
// ETAPA 6 — GERAÇÃO DINÂMICA
// ======================================================


// ======================================================
// CONFIGURAÇÕES
// ======================================================

const CONFIG = {

    intervaloGeracao: 1000,

    limiteElementos: 12

};


// ======================================================
// ESTADO
// ======================================================

const sistema = {

    elementos: [],

    intervalo: null,

    geracaoAtiva: false

};


// ======================================================
// ELEMENTOS DA INTERFACE
// ======================================================

const cena =
    document.getElementById("cena");

const contador =
    document.getElementById("contador");

const btnIniciar =
    document.getElementById("btnIniciar");

const btnPausar =
    document.getElementById("btnPausar");

const btnLimpar =
    document.getElementById("btnLimpar");


// ======================================================
// EVENTOS
// ======================================================

btnIniciar.addEventListener(
    "click",
    iniciarGeracao
);


btnPausar.addEventListener(
    "click",
    pausarGeracao
);


btnLimpar.addEventListener(
    "click",
    limparCenario
);


// ======================================================
// INICIAR GERAÇÃO
// ======================================================

function iniciarGeracao() {

    if (sistema.geracaoAtiva) {

        return;

    }


    sistema.geracaoAtiva = true;


    gerarElemento();


    sistema.intervalo =
        setInterval(
            gerarElemento,
            CONFIG.intervaloGeracao
        );

}


// ======================================================
// PAUSAR GERAÇÃO
// ======================================================

function pausarGeracao() {

    sistema.geracaoAtiva = false;


    clearInterval(
        sistema.intervalo
    );


    sistema.intervalo = null;

}


// ======================================================
// GERAR ELEMENTO
// ======================================================

function gerarElemento() {

    if (
        sistema.elementos.length >=
        CONFIG.limiteElementos
    ) {

        pausarGeracao();

        return;

    }


    const arvore =
        criarArvore();


    posicionarElemento(
        arvore
    );


    cena.appendChild(
        arvore
    );


    sistema.elementos.push(
        arvore
    );


    atualizarContador();

}


// ======================================================
// CRIAR ÁRVORE
// ======================================================

function criarArvore() {

    const arvore =
        document.createElement("div");


    arvore.classList.add(
        "arvore",
        "objeto-cenario"
    );


    const escala =
        0.7 + Math.random() * 0.6;


    arvore.style.transform =
        `scale(${escala})`;


    return arvore;

}


// ======================================================
// POSICIONAR ELEMENTO
// ======================================================

function posicionarElemento(
    elemento
) {

    const posicao =
        5 + Math.random() * 90;


    elemento.style.left =
        `${posicao}%`;

}


// ======================================================
// CONTADOR
// ======================================================

function atualizarContador() {

    contador.textContent =
        `Elementos: ${sistema.elementos.length}`;

}


// ======================================================
// LIMPAR CENÁRIO
// ======================================================

function limparCenario() {

    pausarGeracao();


    sistema.elementos.forEach(
        function (elemento) {

            elemento.remove();

        }
    );


    sistema.elementos = [];


    atualizarContador();

}