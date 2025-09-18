const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400;

const confettiCanvas = document.getElementById("confetti");
const confettiCtx = confettiCanvas.getContext("2d");
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
function ConfettiPiece(x, y, shape, color) {
  this.x = x;
  this.y = y;
  this.shape = shape;
  this.color = color;
  this.size = Math.random() * 6 + 4;
  this.speedY = Math.random() * 3 + 2;
  this.speedX = (Math.random() - 0.5) * 2;
}

function launchConfetti() {
  for (let i = 0; i < 150; i++) {
    let x = Math.random() * confettiCanvas.width;
    let y = -10;
    let shapes = ["heart", "square", "circle", "semicircle"];
    let colors = ["red", "blue", "white", "yellow"];
    let shape = shapes[Math.floor(Math.random() * shapes.length)];
    let color = colors[Math.floor(Math.random() * colors.length)];
    confettiPieces.push(new ConfettiPiece(x, y, shape, color));
  }
}

function drawConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  for (let i = 0; i < confettiPieces.length; i++) {
    let p = confettiPieces[i];
    confettiCtx.fillStyle = p.color;

    confettiCtx.beginPath();
    if (p.shape === "circle") {
      confettiCtx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
    } else if (p.shape === "square") {
      confettiCtx.rect(p.x, p.y, p.size, p.size);
    } else if (p.shape === "semicircle") {
      confettiCtx.arc(p.x, p.y, p.size, 0, Math.PI);
    } else if (p.shape === "heart") {
      confettiCtx.moveTo(p.x, p.y);
      confettiCtx.arc(p.x - p.size / 2, p.y, p.size / 2, 0, Math.PI, true);
      confettiCtx.arc(p.x + p.size / 2, p.y, p.size / 2, 0, Math.PI, true);
      confettiCtx.lineTo(p.x, p.y + p.size);
    }
    confettiCtx.fill();

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