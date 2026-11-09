/**
 * NEXUS 3D // Fallback Canvas 3D Engine
 * Runs if Three.js CDN is unavailable (e.g., offline environments).
 * Renders 3D projected stars, constellation lines, and wireframe polyhedra.
 */

window.initFallback3D = function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Mouse
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - width / 2) * 0.05;
    targetMouseY = (e.clientY - height / 2) * 0.05;
  });

  // Particle Stars (3D Coordinates)
  const starCount = 300;
  const stars = [];
  const fov = 400;

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 1600,
      y: (Math.random() - 0.5) * 1200,
      z: Math.random() * 1000 + 10,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.8 + 0.2
    });
  }

  // 3D Icosahedron Vertices
  const phi = (1 + Math.sqrt(5)) / 2;
  const baseVertices = [
    [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
    [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
    [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
  ].map(([x, y, z]) => {
    const len = Math.hypot(x, y, z);
    return [x / len * 120, y / len * 120, z / len * 120];
  });

  // Edges
  const edges = [];
  for (let i = 0; i < baseVertices.length; i++) {
    for (let j = i + 1; j < baseVertices.length; j++) {
      const d = Math.hypot(
        baseVertices[i][0] - baseVertices[j][0],
        baseVertices[i][1] - baseVertices[j][1],
        baseVertices[i][2] - baseVertices[j][2]
      );
      if (Math.abs(d - 126) < 10) {
        edges.push([i, j]);
      }
    }
  }

  let angleX = 0;
  let angleY = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    angleX += 0.006;
    angleY += 0.009;

    // 1. Draw 3D Stars
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary').trim() || '#00dfd8';
    
    ctx.fillStyle = accentColor;
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      star.z -= star.speed;
      if (star.z <= 0) {
        star.z = 1000;
        star.x = (Math.random() - 0.5) * 1600;
        star.y = (Math.random() - 0.5) * 1200;
      }

      const k = fov / star.z;
      const px = star.x * k + width / 2 - mouseX * (100 / star.z);
      const py = star.y * k + height / 2 - mouseY * (100 / star.z);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        const alpha = Math.min(1, (1000 - star.z) / 400);
        ctx.globalAlpha = alpha * 0.7;
        ctx.beginPath();
        ctx.arc(px, py, star.size * k * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Draw 3D Rotating Polyhedron in Corner
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.2;

    const cornerX = width > 768 ? width * 0.18 : width / 2;
    const cornerY = height * 0.35;
    const polyZ = 650;

    const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);

    const projected = baseVertices.map(([vx, vy, vz]) => {
      // Rotate Y
      let x1 = vx * cosY + vz * sinY;
      let y1 = vy;
      let z1 = -vx * sinY + vz * cosY;

      // Rotate X
      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX + polyZ;

      const scale = fov / z2;
      return [x2 * scale + cornerX, y2 * scale + cornerY];
    });

    edges.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(projected[i][0], projected[i][1]);
      ctx.lineTo(projected[j][0], projected[j][1]);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(render);
  }

  render();
};
