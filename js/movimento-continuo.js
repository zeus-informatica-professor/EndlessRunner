
const cena=document.getElementById("cena");
const btnIniciar=document.getElementById("btnIniciar");
const btnPausar=document.getElementById("btnPausar");

let jogoAtivo=false;
let ultimoTempo=0;
let proximoElemento=0;
let elementos=[];

function criarElemento(){
    const arvore=document.createElement("div");
    arvore.classList.add("arvore","objeto-cenario");
    arvore.style.left=(100+Math.random()*30)+"%";
    const escala=0.75+Math.random()*0.6;
    arvore.style.transform=`scale(${escala})`;
    cena.appendChild(arvore);
    elementos.push(arvore);
}

function atualizar(delta){
    elementos.forEach(function(elemento){
        const esquerda=parseFloat(elemento.style.left);
        elemento.style.left=(esquerda-delta*0.04)+"%";
    });

    elementos=elementos.filter(function(elemento){
        if(parseFloat(elemento.style.left)<-15){
            elemento.remove();
            return false;
        }
        return true;
    });
}

function animar(tempo){
    if(!jogoAtivo)return;

    const delta=tempo-ultimoTempo;
    ultimoTempo=tempo;
    proximoElemento-=delta;

    if(proximoElemento<=0){
        criarElemento();
        proximoElemento=600+Math.random()*900;
    }

    atualizar(delta);
    requestAnimationFrame(animar);
}

btnIniciar.addEventListener("click",function(){
    if(jogoAtivo)return;
    jogoAtivo=true;
    ultimoTempo=performance.now();
    proximoElemento=100;
    requestAnimationFrame(animar);
});

btnPausar.addEventListener("click",function(){
    jogoAtivo=false;
});
