let botao_mensagens = document.getElementById("btn-enviar")
let canvas = document.getElementById('quadro-desenho');
let contexto = canvas.getContext('2d');
let desenhando = false;
let corAtual = "black";

let botoesCores = document.querySelectorAll('.cor-botao');
botoesCores.forEach(function(botao){
    botao.addEventListener('click', function(){
        corAtual = botao.getAttribute('data-cor');
    });
});


function pegarPosicao(evento) {
    const retangulo = canvas.getBoundingClientRect();
    const escalaX = canvas.width / retangulo.width;
    const escalaY = canvas.height / retangulo.height;

    if (evento.touches && evento.touches.length > 0) {
        return {
            x: (evento.touches[0].clientX - retangulo.left) * escalaX,
            y: (evento.touches[0].clientY - retangulo.top) * escalaY
        };
    }

    return {
        x: (evento.clientX - retangulo.left) * escalaX,
        y: (evento.clientY - retangulo.top) * escalaY
    };
}

function iniciarDesenho(evento){
    evento.preventDefault();
    desenhando = true;
    const posicao = pegarPosicao(evento);
    contexto.beginPath();
    contexto.moveTo(posicao.x, posicao.y);
    contexto.strokeStyle = corAtual;
    contexto.lineWidth = 3;
}

function desenharNoCanvas(evento){
    if (!desenhando) return;
    evento.preventDefault();
    const posicao = pegarPosicao(evento);
    contexto.lineTo(posicao.x, posicao.y);
    contexto.stroke();
}

function pararDesenho(){
    desenhando = false;
}

// Mouse (desktop)
canvas.addEventListener('mousedown', iniciarDesenho);
canvas.addEventListener('mousemove', desenharNoCanvas);
canvas.addEventListener('mouseup', pararDesenho);
canvas.addEventListener('mouseleave', pararDesenho);

// Touch (celular/tablet)
canvas.addEventListener('touchstart', iniciarDesenho, { passive: false });
canvas.addEventListener('touchmove', desenharNoCanvas, { passive: false });
canvas.addEventListener('touchend', pararDesenho);
canvas.addEventListener('touchcancel', pararDesenho);
});

let botao_limpar = document.getElementById('btn-limpar');
botao_limpar.addEventListener('click', function(){
    contexto.clearRect(0, 0, canvas.width, canvas.height);
});

function carregarMensagens() {
    fetch('/mensagens')
        .then(resposta => resposta.json())
        .then(lista => {
        let container = document.getElementById('lista-recadinhos');
        lista.forEach(mensagemAtual => {
        let novoParagrafo = document.createElement('p');
        novoParagrafo.classList.add('recadinho');
        novoParagrafo.innerHTML = `<strong>${mensagemAtual.nome}:</strong> ${mensagemAtual.texto}`;
        container.appendChild(novoParagrafo);
});
        });
}

botao_mensagens.addEventListener('click', function(){
    let caixa_mensagens = document.getElementById("campo-mensagens").value;
    let nome_da_pessoa = document.getElementById("campo-nome").value;

    if (caixa_mensagens.trim() === "") {
        alert("Escreve alguma coisa antes de enviar! 🥺");
        return;
    }

fetch('/mensagens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensagem: caixa_mensagens, nome: nome_da_pessoa })
})
.then(resposta => resposta.text())
.then(textoResposta => {
    alert(textoResposta);
});
});

let campo_mensagem = document.getElementById("campo-mensagens");
let contador = document.getElementById("contador");

campo_mensagem.addEventListener('input', function(){
    let quantidade = campo_mensagem.value.length;
    contador.textContent = `${quantidade}/280`;
});

let botao_enviar_desenho = document.getElementById('btn-enviar-desenho');

botao_enviar_desenho.addEventListener('click', function(){
    let imagemBase64 = canvas.toDataURL();

    fetch('/desenhos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagem: imagemBase64 })
    })
    .then(resposta => resposta.text())
    .then(textoResposta => {
        alert(textoResposta);
    });
});

function carregarDesenhos() {
    fetch('/desenhos')
        .then(resposta => resposta.json())
        .then(lista => {
            let galeria = document.getElementById('galeria-desenhos');
            lista.forEach(desenhoAtual => {
                let novaImagem = document.createElement('img');
                novaImagem.src = desenhoAtual.imagem;
                novaImagem.classList.add('desenho-item');
                galeria.appendChild(novaImagem);
            });
        });
}


carregarMensagens();
carregarDesenhos();



const audio = document.getElementById('audio');
const cover = document.getElementById('cover');
const trackTitle = document.getElementById('trackTitle');
const trackSub = document.getElementById('trackSub');
const seekBar = document.getElementById('seekBar');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeBar = document.getElementById('volumeBar');
const muteBtn = document.getElementById('muteBtn');
const volIcon = document.getElementById('volIcon');
const fileInput = document.getElementById('fileInput');
const playlistEl = document.getElementById('playlist');

let playlist = [];
let currentIndex = -1;
let lastVolume = 0.8;

const ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
const ICON_PAUSE = '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>';
const ICON_VOL = '<path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.72 2.5-2.24 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
const ICON_MUTE = '<path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.42.05-.63zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';

function fmt(t) {
  if (isNaN(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function renderPlaylist() {
  if (playlist.length === 0) {
    playlistEl.innerHTML = '<div class="empty-msg">Sua playlist aparecerá aqui.</div>';
    return;
  }
  playlistEl.innerHTML = playlist.map((track, i) => `
    <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
      ${i + 1}. ${track.name}
    </div>
  `).join('');
  playlistEl.querySelectorAll('.playlist-item').forEach(el => {
    el.addEventListener('click', () => loadTrack(parseInt(el.dataset.index), true));
  });
}

function loadTrack(index, autoplay) {
  if (index < 0 || index >= playlist.length) return;
  currentIndex = index;
  const track = playlist[index];
  audio.src = track.url;
  trackTitle.textContent = track.name;
  trackSub.textContent = `Faixa ${index + 1} de ${playlist.length}`;
  renderPlaylist();
  if (autoplay) {
    audio.play();
  }
}

function setPlayingUI(isPlaying) {
  playIcon.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;
  cover.classList.toggle('playing', isPlaying);
}

playBtn.addEventListener('click', () => {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});

audio.addEventListener('play', () => setPlayingUI(true));
audio.addEventListener('pause', () => setPlayingUI(false));

audio.addEventListener('timeupdate', () => {
  if (!isNaN(audio.duration)) {
    seekBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = fmt(audio.currentTime);
    durationTimeEl.textContent = fmt(audio.duration);
  }
});

seekBar.addEventListener('input', () => {
  if (!isNaN(audio.duration)) {
    audio.currentTime = (seekBar.value / 100) * audio.duration;
  }
});

audio.addEventListener('ended', () => {
  nextBtn.click();
});

prevBtn.addEventListener('click', () => {
  if (playlist.length === 0) return;
  const newIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(newIndex, true);
});

nextBtn.addEventListener('click', () => {
  if (playlist.length === 0) return;
  const newIndex = (currentIndex + 1) % playlist.length;
  loadTrack(newIndex, true);
});

volumeBar.addEventListener('input', () => {
  audio.volume = volumeBar.value;
  lastVolume = volumeBar.value;
  volIcon.innerHTML = volumeBar.value == 0 ? ICON_MUTE : ICON_VOL;
});
audio.volume = volumeBar.value;

muteBtn.addEventListener('click', () => {
  if (audio.volume > 0) {
    lastVolume = volumeBar.value;
    audio.volume = 0;
    volumeBar.value = 0;
    volIcon.innerHTML = ICON_MUTE;
  } else {
    audio.volume = lastVolume > 0 ? lastVolume : 0.8;
    volumeBar.value = audio.volume;
    volIcon.innerHTML = ICON_VOL;
  }
});

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  const wasEmpty = playlist.length === 0;
  files.forEach(file => {
    playlist.push({ name: file.name.replace(/\.[^/.]+$/, ''), url: URL.createObjectURL(file) });
  });
  renderPlaylist();
  if (wasEmpty && playlist.length > 0) {
    loadTrack(0, false);
  }
  fileInput.value = '';
});
