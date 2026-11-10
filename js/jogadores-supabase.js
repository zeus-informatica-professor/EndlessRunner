(function () {
    "use strict";

    const form = document.getElementById("formJogadorSupabase");
    const campoNome = document.getElementById("nomeJogadorSupabase");
    const campoPontuacao = document.getElementById("pontuacaoJogadorSupabase");
    const campoCor = document.getElementById("corJogadorSupabase");
    const valorCor = document.getElementById("valorCorSupabase");
    const tituloFormulario = document.getElementById("tituloFormularioSupabase");
    const btnSalvar = document.getElementById("btnSalvarSupabase");
    const btnCancelar = document.getElementById("btnCancelarSupabase");
    const btnConectar = document.getElementById("btnConectar");
    const btnDesconectar = document.getElementById("btnDesconectar");
    const btnAtualizar = document.getElementById("btnAtualizarLista");
    const campoUrl = document.getElementById("supabaseUrl");
    const campoChave = document.getElementById("supabaseKey");
    const statusConexao = document.getElementById("statusConexao");
    const mensagem = document.getElementById("mensagemCrudSupabase");
    const lista = document.getElementById("listaJogadoresSupabase");
    const listaVazia = document.getElementById("listaVaziaSupabase");
    const contador = document.getElementById("contadorSupabase");

    let cliente = null;
    let idEmEdicao = null;
    let jogadores = [];

    function mostrarStatus(elemento, texto, tipo) {
        elemento.textContent = texto;
        elemento.dataset.tipo = tipo || "info";
    }

    function mostrarErro(erro, contexto) {
        console.error(contexto, erro);
        const detalhe = erro && erro.message ? erro.message : "Verifique a conexão e as permissões da tabela.";
        mostrarStatus(mensagem, contexto + " " + detalhe, "erro");
    }

    function limparFormulario() {
        form.reset();
        campoPontuacao.value = "0";
        campoCor.value = "#22c55e";
        valorCor.value = campoCor.value;
        idEmEdicao = null;
        tituloFormulario.textContent = "Cadastrar jogador no Supabase";
        btnSalvar.textContent = "Cadastrar no banco";
        btnCancelar.hidden = true;
    }

    function celula(texto) {
        const td = document.createElement("td");
        td.textContent = String(texto);
        return td;
    }

    function botao(texto, classe, acao, rotulo) {
        const elemento = document.createElement("button");
        elemento.type = "button";
        elemento.className = classe;
        elemento.textContent = texto;
        elemento.setAttribute("aria-label", rotulo);
        elemento.addEventListener("click", acao);
        return elemento;
    }

    async function carregarJogadores() {
        if (!cliente) {
            mostrarStatus(statusConexao, "Conecte-se ao Supabase antes de consultar.", "erro");
            return;
        }

        mostrarStatus(statusConexao, "Consultando public.jogadores...", "info");
        const resposta = await cliente
            .from("jogadores")
            .select("id, nome, pontuacao, cor, criado_em, atualizado_em")
            .order("pontuacao", { ascending: false });

        if (resposta.error) {
            mostrarErro(resposta.error, "Falha ao consultar jogadores:");
            mostrarStatus(statusConexao, "Consulta não concluída. Confira RLS, permissões e nome da tabela.", "erro");
            return;
        }

        jogadores = resposta.data || [];
        renderizar();
        mostrarStatus(statusConexao, "Conectado. " + jogadores.length + " jogador(es) recuperado(s) do PostgreSQL.", "sucesso");
    }

    function renderizar() {
        lista.replaceChildren();
        contador.textContent = jogadores.length + (jogadores.length === 1 ? " jogador" : " jogadores");
        listaVazia.hidden = jogadores.length > 0;
        listaVazia.textContent = jogadores.length ? "" : "Nenhum jogador encontrado na tabela.";

        jogadores.forEach(function (jogador) {
            const linha = document.createElement("tr");
            linha.appendChild(celula(jogador.id));
            linha.appendChild(celula(jogador.nome));
            linha.appendChild(celula(jogador.pontuacao));

            const tdCor = document.createElement("td");
            const amostra = document.createElement("span");
            amostra.className = "amostra-cor";
            amostra.style.backgroundColor = jogador.cor;
            amostra.title = jogador.cor;
            const codigo = document.createElement("span");
            codigo.textContent = jogador.cor;
            tdCor.append(amostra, codigo);
            linha.appendChild(tdCor);

            const tdAcoes = document.createElement("td");
            const acoes = document.createElement("div");
            acoes.className = "acoes-registro";
            acoes.appendChild(botao("Editar", "botao-pequeno botao-neutro", function () {
                iniciarEdicao(jogador);
            }, "Editar " + jogador.nome));
            acoes.appendChild(botao("Excluir", "botao-pequeno botao-perigo", function () {
                excluirJogador(jogador);
            }, "Excluir " + jogador.nome));
            tdAcoes.appendChild(acoes);
            linha.appendChild(tdAcoes);
            lista.appendChild(linha);
        });
    }

    function iniciarEdicao(jogador) {
        idEmEdicao = jogador.id;
        campoNome.value = jogador.nome;
        campoPontuacao.value = String(jogador.pontuacao);
        campoCor.value = jogador.cor;
        valorCor.value = jogador.cor;
        tituloFormulario.textContent = "Editar jogador no Supabase (ID " + jogador.id + ")";
        btnSalvar.textContent = "Salvar alterações no banco";
        btnCancelar.hidden = false;
        campoNome.focus();
    }

    async function excluirJogador(jogador) {
        if (!window.confirm("Excluir \"" + jogador.nome + "\" do banco de dados?")) return;

        const resposta = await cliente
            .from("jogadores")
            .delete()
            .eq("id", jogador.id);

        if (resposta.error) {
            mostrarErro(resposta.error, "Não foi possível excluir:");
            return;
        }

        if (idEmEdicao === jogador.id) limparFormulario();
        mostrarStatus(mensagem, "Jogador excluído do PostgreSQL.", "sucesso");
        await carregarJogadores();
    }

    async function conectar() {
        const url = campoUrl.value.trim();
        const chave = campoChave.value.trim();

        if (!url || !chave || url.indexOf("https://") !== 0) {
            mostrarStatus(statusConexao, "Informe uma Project URL válida e a chave pública do Supabase.", "erro");
            return;
        }
        if (!window.supabase || typeof window.supabase.createClient !== "function") {
            mostrarStatus(statusConexao, "A biblioteca Supabase não foi carregada. Verifique a internet e recarregue a página.", "erro");
            return;
        }

        try {
            cliente = window.supabase.createClient(url, chave);
            await carregarJogadores();
        } catch (erro) {
            cliente = null;
            mostrarErro(erro, "Não foi possível iniciar a conexão:");
        }
    }

    form.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        if (!cliente) {
            mostrarStatus(mensagem, "Conecte-se ao Supabase antes de salvar.", "erro");
            return;
        }

        const nome = campoNome.value.trim();
        const pontuacao = Number(campoPontuacao.value);
        const cor = campoCor.value;

        if (nome.length < 2 || nome.length > 60) {
            mostrarStatus(mensagem, "O nome deve ter entre 2 e 60 caracteres.", "erro");
            campoNome.focus();
            return;
        }
        if (!Number.isSafeInteger(pontuacao) || pontuacao < 0 || pontuacao > 999999) {
            mostrarStatus(mensagem, "Informe uma pontuação inteira entre 0 e 999999.", "erro");
            campoPontuacao.focus();
            return;
        }
        if (!/^#[0-9a-fA-F]{6}$/.test(cor)) {
            mostrarStatus(mensagem, "Selecione uma cor hexadecimal válida.", "erro");
            campoCor.focus();
            return;
        }

        const dados = { nome: nome, pontuacao: pontuacao, cor: cor };
        let resposta;

        if (idEmEdicao !== null) {
            resposta = await cliente.from("jogadores").update(dados).eq("id", idEmEdicao);
        } else {
            resposta = await cliente.from("jogadores").insert(dados);
        }

        if (resposta.error) {
            mostrarErro(resposta.error, "Não foi possível salvar:");
            return;
        }

        mostrarStatus(mensagem, idEmEdicao !== null ? "Jogador atualizado no PostgreSQL." : "Jogador cadastrado no PostgreSQL.", "sucesso");
        limparFormulario();
        await carregarJogadores();
    });

    btnConectar.addEventListener("click", conectar);
    btnDesconectar.addEventListener("click", function () {
        cliente = null;
        jogadores = [];
        renderizar();
        mostrarStatus(statusConexao, "Desconectado. Nenhuma operação remota será realizada.", "info");
    });
    btnAtualizar.addEventListener("click", carregarJogadores);
    btnCancelar.addEventListener("click", function () {
        limparFormulario();
        mostrarStatus(mensagem, "Edição cancelada.", "info");
    });
    campoCor.addEventListener("input", function () {
        valorCor.value = campoCor.value;
    });

    const config = window.SUPABASE_CONFIG || {};
    if (config.url && config.url.indexOf("COLE_AQUI_") !== 0) campoUrl.value = config.url;
    if (config.anonKey && config.anonKey.indexOf("COLE_AQUI_") !== 0) campoChave.value = config.anonKey;
})();
