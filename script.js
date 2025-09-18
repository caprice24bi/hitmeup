const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400; // bisa disesuaikan

const confettiCanvas = document.getElementById("confetti");
const confettiCtx = confettiCanvas.getContext("2d");
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

let candlesLit = [true, true, true, true, true];
let confettiPieces = [];

// draw cake 3 layer menempel rapi
function drawCake() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // tinggi layer
  const bottomHeight = 60;
  const middleHeight = 50;
  const topHeight = 40;

  // layer bawah
  ctx.fillStyle = "#f4a7b9"; 
  const bottomY = 260;
  ctx.fillRect(120, bottomY, 160, bottomHeight);

  // layer tengah
  ctx.fillStyle = "#c8e6f8"; 
  const middleY = bottomY - middleHeight;
  ctx.fillRect(130, middleY, 140, middleHeight);

  // layer atas
  ctx.fillStyle = "#d9f8c8"; 
  const topY = middleY - topHeight;
  ctx.fillRect(140, topY, 120, topHeight);

  // lilin
  const spacing = 180 / (candlesLit.length + 1);
  for (let i = 0; i < candlesLit.length; i++) {
    const x = 160 + spacing * (i + 1);
    const y = topY - 30;

    // batang lilin
    ctx.fillStyle = "#87cefa";
    ctx.fillRect(x - 5, y, 10, 40);

    if (candlesLit[i]) {
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
}

function animate() {
  drawCake();
  requestAnimationFrame(animate);
}

animate();

// confetti
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
    let colors = ["#ff7675", "#74b9ff", "#ffeaa7", "#55efc4", "#fd79a8"];
    let color = colors[Math.floor(Math.random() * colors.length)];
    confettiPieces.push(new ConfettiPiece(x, y, color));
  }
}

function drawConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  for (let i = 0; i < confettiPieces.length; i++) {
    let p = confettiPieces[i];
    confettiCtx.fillStyle = p.color;
    confettiCtx.beginPath();
    confettiCtx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
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

// mic blow
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
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

      if (average > 50 && candlesLit.some(l => l)) {
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
  .catch(err => console.log("Mic not allowed", err));

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
