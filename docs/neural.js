(() => {
  const canvas = document.getElementById('neural-field');
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const pointer = { x: 0, y: 0, active: false };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let nodes = [];
  let rafId = 0;

  const config = {
    density: 0.000055,
    maxNodes: 92,
    minNodes: 42,
    linkDistance: 148,
    pointerDistance: 180,
    speed: 0.22
  };

  function makeNode() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      r: 1.2 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.max(config.minNodes, Math.min(config.maxNodes, Math.floor(width * height * config.density)));
    nodes = Array.from({ length: target }, makeNode);
  }

  function drawGrid() {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = 'rgba(13, 59, 39, 0.09)';
    ctx.lineWidth = 1;
    const step = 72;
    const offset = (window.scrollY || 0) * 0.03;

    for (let x = -step; x < width + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x + (offset % step), 0);
      ctx.lineTo(x + (offset % step), height);
      ctx.stroke();
    }
    for (let y = -step; y < height + step; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y + (offset % step));
      ctx.lineTo(width, y + (offset % step));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawNode(node, time) {
    const pulse = Math.sin(time * 0.001 + node.phase) * 0.45 + 0.55;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r + pulse * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(45, 125, 84, ${0.14 + pulse * 0.13})`;
    ctx.fill();
  }

  function drawLinks() {
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        if (distance > config.linkDistance) continue;
        const alpha = (1 - distance / config.linkDistance) * 0.12;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(13, 59, 39, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (pointer.active) {
        const dx = a.x - pointer.x;
        const dy = a.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < config.pointerDistance) {
          const alpha = (1 - distance / config.pointerDistance) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(166, 132, 74, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function updateNodes() {
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < -20) node.x = width + 20;
      if (node.x > width + 20) node.x = -20;
      if (node.y < -20) node.y = height + 20;
      if (node.y > height + 20) node.y = -20;
    });
  }

  function frame(time) {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawLinks();
    nodes.forEach((node) => drawNode(node, time));
    updateNodes();
    rafId = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else rafId = requestAnimationFrame(frame);
  });

  resize();
  rafId = requestAnimationFrame(frame);
})();
