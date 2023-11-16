/* A função novoElemento recebe o nome da tag e da classe, especifica o tipo de elemento html (div, span, etc) e a classe a ser utilizada no CSS. Por fim, retorna esse objeto criado! */
function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem;
}

/* A função barreira recebe o valor false e cria 3 elementos: barreira (atribuido ao membro do objeto atual), borda e corpo. Depos atribui a barreira a borda e corpo para contrui-la. Dependendo do valor da 'reversa' a função muda a ordem da barreira e do corpo. Por fim, atribui a altura a barreia. */
function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

/* A função parDeBarreiras recebe altura, abertura e x. Para o objeto atual é criado um elemento. Também é criado a parte superior e inferior da barreira, utilizando a função 'barreira'. Depois é atribuido ao elemento atual as partes superior e inferior. Existe uma outra função para sortear altura utilizando valores aleatorios e depois é atribuida ao membros superior e inferior do elemento atual. Depois, são criadas as funções getX, setX, getLargura para encontrar a posição, atribuir posição e encontrar a largura, respectivamente. Por fim, as funções sortearAltura e setX são invocadas. */
function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

/* Devemos então criar um novo objeto parDeBarreiras passando a altura, abertura e o x (posição) e anexa-lo ao HTML com a classe wm-flappy*/
// const b = new parDeBarreiras(700, 300, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

/* A função Barreiras recebe varios parametros. Ela cria 4 pares de barreiras e cada uma distante da outra. Para animar é obtido o valor da posição atual e diminuido o deslocamento e então setado essa nova posição. Quando o elemtno sair da tela de jogo,ele retorna para aposição da ultima barreira la no inicio e recebe uma nova abertura. Para notificar o jogador da sua pontuação é calculado o meio da abertura, e caso a barreira esteja em uma posição menor que o meio ou a soma dela com o deslocamento seja maior que o meio, um ponto é acrescido no progresso */
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área de jogo
            if(par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
        })
    }
}


function Personagem(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'personagem')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 7 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}
/* A função estaoSobrepostos verifica se os elementos passaro e barreira estão sobrepostos. Afunção getboudingclientrect pega as dimensões dos elementos. Depois é definido as constante horizontal e vertical capturando o lado esquerdo + a largura do elemento == ao lado direito e checando se coincide com o lado esquerdo do outro elemento. A mesma lógica é palicada para ver se o topo se sobrepõe.*/
function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(personagem, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(personagem.elemento, superior) || estaoSobrepostos(personagem.elemento, inferior)
        }
    })
    return colidiu;
}

function fimDeJogo() {
    const restartButton = document.createElement('button')
    restartButton.classList.add('restart')
    restartButton.textContent = 'Restart'
    restartButton.addEventListener("click", () => {
        document.body.removeChild(restartButton)
        document.body.removeChild(exitButton)
        window.location.reload()
        new flappyBird().start()
    });

    const exitButton = document.createElement('button')
    exitButton.classList.add('exit')
    exitButton.textContent = "Exit";
    exitButton.addEventListener("click", () => {
        window.location.href = "menuFlappy.html"
    });

    document.body.appendChild(restartButton);
    document.body.appendChild(exitButton);
}

function flappyBird() {
    let pontos = 0;

    const areaDoJogo = document.querySelector('[wm-flappy]');
    const altura = areaDoJogo.clientHeight;
    const largura = areaDoJogo.clientWidth;

    const progresso = new Progresso();
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos));
    const personagem = new Personagem(altura);

    areaDoJogo.appendChild(progresso.elemento);
    areaDoJogo.appendChild(personagem.elemento);
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento));

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar();
            personagem.animar();

            if (colidiu(personagem, barreiras)) {
                clearInterval(temporizador);
                fimDeJogo();
            }
        }, 20);
    };
}

new flappyBird().start();
