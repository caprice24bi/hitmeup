// ambil canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const confettiCanvas = document.getElementById("confetti");
const confettiCtx = confettiCanvas.getContext("2d");

// atur ukuran canvas full screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let candlesLit = [true, true, true, true, true];
let confettiPieces = [];

function drawCake() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // skala berdasarkan ukuran layar
  const scale = Math.min(canvas.width, canvas.height) / 400;
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2); // posisi tengah
  ctx.scale(scale, scale);
  ctx.translate(-200, -200); // geser biar gambar di tengah

  // === kue 3 layer ===
  ctx.fillStyle = "#f8c8dc"; // pink pastel
  ctx.fillRect(120, 260, 260, 80);

  ctx.fillStyle = "#c8e6f8"; // biru pastel
  ctx.fillRect(140, 200, 220, 60);

  ctx.fillStyle = "#d9f8c8"; // hijau pastel
  ctx.fillRect(160, 150, 180, 50);

 // === lilin ===
  const spacing = 180 / (candlesLit.length + 1);
  for (let i = 0; i < candlesLit.length; i++) {
    const x = 160 + spacing * (i + 1);
    const y = 130;

    // batang lilin
    ctx.fillStyle = "#87cefa";
    ctx.fillRect(x - 5, y, 10, 40);

    if (candlesLit[i]) {
      // efek flicker
      const flickerX = (Math.random() - 0.5) * 4;
      const flickerY = (Math.random() - 0.5) * 2;
      const flameHeight = 12 + Math.random() * 2;

      ctx.beginPath();
      ctx.ellipse(
        x + flickerX,
        y - 10 + flickerY,
        6,
        flameHeight,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "orange";
      ctx.fill();

      ctx.shadowColor = "yellow";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  ctx.restore();
}

function animate() {
  drawCake();
  requestAnimationFrame(animate);
}

animate();
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
