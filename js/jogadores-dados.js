/*
 * Modelo de dados didático para jogadores.
 * Nesta versão, localStorage funciona como armazenamento local.
 * A estrutura será mapeada futuramente para uma tabela PostgreSQL/Supabase.
 */
(function () {
    "use strict";

    const CHAVE_JOGADORES = "ficEndlessJogadoresV1";
    const CHAVE_JOGADOR_ATIVO = "ficEndlessJogadorAtivoV1";

    function criarId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }
        // Fallback com formato UUID para ambientes sem randomUUID.
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (caractere) {
            const aleatorio = Math.random() * 16 | 0;
            const valor = caractere === "x" ? aleatorio : (aleatorio & 0x3 | 0x8);
            return valor.toString(16);
        });
    }

    function lerJogadores() {
        try {
            const dados = localStorage.getItem(CHAVE_JOGADORES);
            if (!dados) return [];
            const jogadores = JSON.parse(dados);
            if (!Array.isArray(jogadores)) throw new Error("O armazenamento de jogadores não contém uma lista.");

            return jogadores.filter(function (jogador) {
                return jogador && typeof jogador.id === "string" && typeof jogador.nome === "string";
            }).map(function (jogador) {
                return {
                    id: jogador.id,
                    nome: jogador.nome.trim(),
                    pontuacao: Number.isSafeInteger(Number(jogador.pontuacao)) && Number(jogador.pontuacao) >= 0
                        ? Number(jogador.pontuacao) : 0,
                    cor: /^#[0-9a-fA-F]{6}$/.test(jogador.cor) ? jogador.cor : "#1976d2",
                    criadoEm: jogador.criadoEm || new Date().toISOString(),
                    atualizadoEm: jogador.atualizadoEm || jogador.criadoEm || new Date().toISOString()
                };
            });
        } catch (erro) {
            console.error("Não foi possível ler os jogadores salvos:", erro);
            return [];
        }
    }

    function salvarJogadores(jogadores) {
        try {
            localStorage.setItem(CHAVE_JOGADORES, JSON.stringify(jogadores));
            return true;
        } catch (erro) {
            console.error("Não foi possível salvar os jogadores:", erro);
            return false;
        }
    }

    function obterJogadorAtivoId() {
        try { return localStorage.getItem(CHAVE_JOGADOR_ATIVO); }
        catch (erro) { console.error("Não foi possível ler o jogador ativo:", erro); return null; }
    }

    function definirJogadorAtivo(id) {
        try {
            if (id) localStorage.setItem(CHAVE_JOGADOR_ATIVO, id);
            else localStorage.removeItem(CHAVE_JOGADOR_ATIVO);
            return true;
        } catch (erro) {
            console.error("Não foi possível definir o jogador ativo:", erro);
            return false;
        }
    }

    function buscarPorId(id) {
        return lerJogadores().find(function (jogador) { return jogador.id === id; }) || null;
    }

    function garantirJogadorInicial() {
        let jogadores = lerJogadores();
        if (jogadores.length === 0) {
            const agora = new Date().toISOString();
            const inicial = {
                id: criarId(), nome: "Jogador 1", pontuacao: 0, cor: "#1976d2",
                criadoEm: agora, atualizadoEm: agora
            };
            jogadores = [inicial];
            salvarJogadores(jogadores);
            definirJogadorAtivo(inicial.id);
            return inicial;
        }
        const ativoId = obterJogadorAtivoId();
        const ativo = jogadores.find(function (jogador) { return jogador.id === ativoId; });
        if (ativo) return ativo;
        definirJogadorAtivo(jogadores[0].id);
        return jogadores[0];
    }

    function criar(dados) {
        const agora = new Date().toISOString();
        const jogador = {
            id: criarId(),
            nome: dados.nome.trim(),
            pontuacao: Number(dados.pontuacao),
            cor: dados.cor,
            criadoEm: agora,
            atualizadoEm: agora
        };
        const jogadores = lerJogadores();
        jogadores.push(jogador);
        if (!salvarJogadores(jogadores)) return null;
        if (!obterJogadorAtivoId()) definirJogadorAtivo(jogador.id);
        return jogador;
    }

    function atualizar(id, dados) {
        const jogadores = lerJogadores();
        const indice = jogadores.findIndex(function (jogador) { return jogador.id === id; });
        if (indice < 0) return null;
        jogadores[indice] = {
            ...jogadores[indice],
            nome: dados.nome.trim(),
            pontuacao: Number(dados.pontuacao),
            cor: dados.cor,
            atualizadoEm: new Date().toISOString()
        };
        return salvarJogadores(jogadores) ? jogadores[indice] : null;
    }

    function excluir(id) {
        const jogadores = lerJogadores();
        const restantes = jogadores.filter(function (jogador) { return jogador.id !== id; });
        if (restantes.length === jogadores.length) return false;
        if (!salvarJogadores(restantes)) return false;
        if (obterJogadorAtivoId() === id) definirJogadorAtivo(restantes[0] ? restantes[0].id : null);
        return true;
    }

    function salvarMelhorPontuacao(id, pontuacao) {
        const jogadores = lerJogadores();
        const jogador = jogadores.find(function (item) { return item.id === id; });
        if (!jogador || !Number.isSafeInteger(pontuacao) || pontuacao < 0) return jogador || null;
        if (pontuacao <= jogador.pontuacao) return jogador;
        jogador.pontuacao = pontuacao;
        jogador.atualizadoEm = new Date().toISOString();
        return salvarJogadores(jogadores) ? jogador : null;
    }

    window.JogadoresStore = {
        listar: lerJogadores,
        buscarPorId: buscarPorId,
        obterJogadorAtivoId: obterJogadorAtivoId,
        definirJogadorAtivo: definirJogadorAtivo,
        garantirJogadorInicial: garantirJogadorInicial,
        criar: criar,
        atualizar: atualizar,
        excluir: excluir,
        salvarMelhorPontuacao: salvarMelhorPontuacao
    };
})();
