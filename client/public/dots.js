// dots.js - Futuristic shaking white dots background

const canvas = document.getElementById('dots-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Configuration options for easy adjustment
const config = {
  dotCount: 600, // Increased for a denser effect
  shadowBlur: 5,  // Increased for better visibility
  dotOpacity: 0.9
};

const DOTS = config.dotCount;
const dots = [];

for (let i = 0; i < DOTS; i++) {
  const angle = Math.random() * Math.PI * 2;
  dots.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2.5 + 1.5,
    shakeRadius: Math.random() * 8 + 3,
    shakeSpeed: Math.random() * 1.5 + 0.5,
    shakeAngle: angle,
    shakePhase: Math.random() * Math.PI * 2,
  });
}

function animateDots() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let dot of dots) {
    // Calculate shaking offset
    const t = performance.now() / 1000;
    const shakeX = Math.cos(t * dot.shakeSpeed + dot.shakePhase) * dot.shakeRadius;
    const shakeY = Math.sin(t * dot.shakeSpeed + dot.shakePhase) * dot.shakeRadius;
    let x = dot.x + shakeX;
    let y = dot.y + shakeY;

    // Wrap around edges
    if (x < 0) x += canvas.width;
    if (x > canvas.width) x -= canvas.width;
    if (y < 0) y += canvas.height;
    if (y > canvas.height) y -= canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, dot.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(34,197,94,${config.dotOpacity})`;
    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = config.shadowBlur;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  requestAnimationFrame(animateDots);
}

animateDots();

