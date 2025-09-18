const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("3d");
canvas.width = 400;
canvas.height = 400;

const confettiCanvas = document.getElementById("confetti");
const confettiCtx = confettiCanvas.getContext("3d");
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

let candlesLit = [true, true, true, true, true];
let confettiPieces = [];

// gambar kue
function drawCake() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // kue dasar
  ctx.fillStyle = "#d2691e";
  ctx.fillRect(100, 250, 200, 100);
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(100, 230, 200, 20);

  // lilin
  const spacing = 200 / (candlesLit.length + 1);
  for (let i = 0; i < candlesLit.length; i++) {
    const x = 100 + spacing * (i + 1);
    const y = 190;

    ctx.fillStyle = "#87cefa";
    ctx.fillRect(x - 5, y, 10, 40);

    if (candlesLit[i]) {
      ctx.beginPath();
      ctx.ellipse(x, y - 10, 6, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = "orange";
      ctx.fill();
    }
  }
}
drawCake();

// confetti class
function ConfettiPiece(x, y, color) {
  this.x = x;
  this.y = y;
  this.color = color;
  this.size = Math.random() * 6 + 4;
  this.speedY = Math.random() * 3 + 2;
  this.speedX = (Math.random() - 0.5) * 2;
}

function launchConfetti() {
  for (let i = 0; i < 150; i++) {
    let x = Math.random() * confettiCanvas.width;
    let y = -10;
    let colors = [
      ["#ff7675", "#ffe6e6"], // merah muda → putih
      ["#74b9ff", "#e3f2fd"], // biru → putih
      ["#ffeaa7", "#fff8e1"], // kuning → putih
      ["#55efc4", "#e0f7f4"], // hijau mint → putih
      ["#fd79a8", "#fde2f2"]  // pink → putih
    ];
    let color = colors[Math.floor(Math.random() * colors.length)];
    confettiPieces.push(new ConfettiPiece(x, y, color));
  }
}

function drawConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  for (let i = 0; i < confettiPieces.length; i++) {
    let p = confettiPieces[i];

    // bikin gradasi radial (dalam → luar)
    let gradient = confettiCtx.createRadialGradient(
      p.x, p.y, p.size * 0.2,   // titik dalam kecil
      p.x, p.y, p.size          // titik luar
    );
    gradient.addColorStop(0, p.color[0]); // warna inti
    gradient.addColorStop(1, p.color[1]); // warna pinggir

    confettiCtx.fillStyle = gradient;
    confettiCtx.beginPath();
    confettiCtx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
    confettiCtx.fill();

    // gerakan jatuh
    p.y += p.speedY;
    p.x += p.speedX;

    if (p.y > confettiCanvas.height) {
      confettiPieces.splice(i, 1);
      i--;
    }
  }
  requestAnimationFrame(drawConfetti);
}
drawConfetti();

  // mic sensitif
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const mic = audioContext.createMediaStreamSource(stream);
    mic.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    function detectBlow() {
      analyser.getByteFrequencyData(data);
      let values = 0;
      for (let i = 0; i < data.length; i++) values += data[i];
      let average = values / data.length;

      if (average > 10 && candlesLit.some(l => l)) {
        for (let i = 0; i < candlesLit.length; i++) {
          if (candlesLit[i]) {
            candlesLit[i] = false;
            break;
          }
        }
        drawCake();

        if (!candlesLit.some(l => l)) {
          launchConfetti();
          document.getElementById("popup").classList.remove("hidden");
        }
      }
      requestAnimationFrame(detectBlow);
    }
    detectBlow();
  })
  .catch(function(err) {
    console.log("Mic not allowed", err);
  });

// fallback klik
canvas.addEventListener("click", () => {
  if (candlesLit.some(l => l)) {
    for (let i = 0; i < candlesLit.length; i++) {
      if (candlesLit[i]) {
        candlesLit[i] = false;
        break;
      }
    }
    drawCake();

    if (!candlesLit.some(l => l)) {
      launchConfetti();
      document.getElementById("popup").classList.remove("hidden");
    }
  }
});
