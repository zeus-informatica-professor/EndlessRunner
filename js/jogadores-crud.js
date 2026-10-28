"use strict";

const formJogador = document.getElementById("formJogador");
const campoNome = document.getElementById("nomeJogador");
const campoPontuacao = document.getElementById("pontuacaoJogador");
const campoCor = document.getElementById("corJogador");
const valorCor = document.getElementById("valorCor");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnSalvarJogador = document.getElementById("btnSalvarJogador");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const mensagemCrud = document.getElementById("mensagemCrud");
const listaJogadores = document.getElementById("listaJogadores");
const listaVazia = document.getElementById("listaVazia");
const contadorJogadores = document.getElementById("contadorJogadores");

let idEmEdicao = null;

function mostrarMensagem(texto, tipo) {
    mensagemCrud.textContent = texto;
    mensagemCrud.dataset.tipo = tipo || "info";
}

function resetarFormulario() {
    formJogador.reset();
    campoPontuacao.value = "0";
    campoCor.value = "#1976d2";
    valorCor.value = campoCor.value;
    idEmEdicao = null;
    tituloFormulario.textContent = "Cadastrar jogador";
    btnSalvarJogador.textContent = "Cadastrar jogador";
    btnCancelarEdicao.hidden = true;
}

function criarCelula(texto) {
    const celula = document.createElement("td");
    celula.textContent = texto;
    return celula;
}

function criarBotao(texto, classe, aoClicar, rotulo) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = classe;
    botao.textContent = texto;
    if (rotulo) botao.setAttribute("aria-label", rotulo);
    botao.addEventListener("click", aoClicar);
    return botao;
}

function iniciarEdicao(jogador) {
    idEmEdicao = jogador.id;
    campoNome.value = jogador.nome;
    campoPontuacao.value = String(jogador.pontuacao);
    campoCor.value = jogador.cor;
    valorCor.value = jogador.cor;
    tituloFormulario.textContent = "Editar jogador";
    btnSalvarJogador.textContent = "Salvar alterações";
    btnCancelarEdicao.hidden = false;
    mostrarMensagem("Editando " + jogador.nome + ". Altere os campos e salve.", "info");
    campoNome.focus();
}

function definirComoAtivo(jogador) {
    if (!JogadoresStore.definirJogadorAtivo(jogador.id)) {
        mostrarMensagem("Não foi possível selecionar esse jogador. Verifique o armazenamento do navegador.", "erro");
        return;
    }
    renderizarJogadores();
    mostrarMensagem(jogador.nome + " será usado na próxima partida.", "sucesso");
}

function excluirJogador(jogador) {
    const confirmado = window.confirm("Excluir o jogador \"" + jogador.nome + "\"? Essa ação não pode ser desfeita.");
    if (!confirmado) return;
    if (!JogadoresStore.excluir(jogador.id)) {
        mostrarMensagem("Não foi possível excluir o jogador.", "erro");
        return;
    }
    if (idEmEdicao === jogador.id) resetarFormulario();
    renderizarJogadores();
    mostrarMensagem("Jogador excluído.", "sucesso");
}

function renderizarJogadores() {
    const jogadores = JogadoresStore.listar();
    const jogadorAtivoId = JogadoresStore.obterJogadorAtivoId();
    listaJogadores.replaceChildren();
    listaVazia.hidden = jogadores.length > 0;
    contadorJogadores.textContent = jogadores.length + (jogadores.length === 1 ? " jogador" : " jogadores");

    jogadores.sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt-BR"); });
    jogadores.forEach(function (jogador) {
        const linha = document.createElement("tr");
        const celulaNome = document.createElement("td");
        const nome = document.createElement("strong");
        nome.textContent = jogador.nome;
        celulaNome.appendChild(nome);
        if (jogador.id === jogadorAtivoId) {
            const selo = document.createElement("span");
            selo.className = "selo-ativo";
            selo.textContent = "Em uso";
            celulaNome.appendChild(selo);
        }
        linha.appendChild(celulaNome);
        linha.appendChild(criarCelula(String(jogador.pontuacao)));

        const celulaCor = document.createElement("td");
        const amostraCor = document.createElement("span");
        amostraCor.className = "amostra-cor";
        amostraCor.style.backgroundColor = jogador.cor;
        amostraCor.setAttribute("aria-label", "Cor " + jogador.cor);
        amostraCor.title = jogador.cor;
        const codigoCor = document.createElement("span");
        codigoCor.textContent = jogador.cor;
        celulaCor.append(amostraCor, codigoCor);
        linha.appendChild(celulaCor);

        const celulaAcoes = document.createElement("td");
        const acoes = document.createElement("div");
        acoes.className = "acoes-registro";
        acoes.appendChild(criarBotao("Usar", "botao-pequeno", function () { definirComoAtivo(jogador); }, "Usar " + jogador.nome + " no jogo"));
        acoes.appendChild(criarBotao("Editar", "botao-pequeno botao-neutro", function () { iniciarEdicao(jogador); }, "Editar " + jogador.nome));
        acoes.appendChild(criarBotao("Excluir", "botao-pequeno botao-perigo", function () { excluirJogador(jogador); }, "Excluir " + jogador.nome));
        celulaAcoes.appendChild(acoes);
        linha.appendChild(celulaAcoes);
        listaJogadores.appendChild(linha);
    });
}

formJogador.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const nome = campoNome.value.trim();
    const pontuacao = Number(campoPontuacao.value);
    const cor = campoCor.value;

    if (nome.length < 2 || nome.length > 40) {
        mostrarMensagem("O nome deve ter entre 2 e 40 caracteres.", "erro");
        campoNome.focus();
        return;
    }
    if (!Number.isSafeInteger(pontuacao) || pontuacao < 0 || pontuacao > 999999) {
        mostrarMensagem("Informe uma pontuação inteira entre 0 e 999999.", "erro");
        campoPontuacao.focus();
        return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(cor)) {
        mostrarMensagem("Selecione uma cor válida.", "erro");
        campoCor.focus();
        return;
    }

    const dados = { nome: nome, pontuacao: pontuacao, cor: cor };
    const jogador = idEmEdicao
        ? JogadoresStore.atualizar(idEmEdicao, dados)
        : JogadoresStore.criar(dados);

    if (!jogador) {
        mostrarMensagem("Não foi possível salvar. Verifique se o armazenamento local está disponível.", "erro");
        return;
    }
    if (!JogadoresStore.obterJogadorAtivoId()) JogadoresStore.definirJogadorAtivo(jogador.id);
    mostrarMensagem(idEmEdicao ? "Alterações salvas." : "Jogador cadastrado.", "sucesso");
    resetarFormulario();
    renderizarJogadores();
});

campoCor.addEventListener("input", function () { valorCor.value = campoCor.value; });
btnCancelarEdicao.addEventListener("click", function () { resetarFormulario(); mostrarMensagem("Edição cancelada.", "info"); });

renderizarJogadores();
