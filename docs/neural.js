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

  const config = { density: 0.000058, maxNodes: 96, minNodes: 46, linkDistance: 152, pointerDistance: 190, speed: 0.24 };

  function makeNode() {
    return { x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * config.speed, vy: (Math.random() - 0.5) * config.speed, r: 1.2 + Math.random() * 1.8, phase: Math.random() * Math.PI * 2 };
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
    ctx.strokeStyle = 'rgba(7, 27, 56, 0.085)';
    ctx.lineWidth = 1;
    const step = 72;
    const offset = (window.scrollY || 0) * 0.03;
    for (let x = -step; x < width + step; x += step) { ctx.beginPath(); ctx.moveTo(x + (offset % step), 0); ctx.lineTo(x + (offset % step), height); ctx.stroke(); }
    for (let y = -step; y < height + step; y += step) { ctx.beginPath(); ctx.moveTo(0, y + (offset % step)); ctx.lineTo(width, y + (offset % step)); ctx.stroke(); }
    ctx.restore();
  }

  function drawNode(node, time) {
    const pulse = Math.sin(time * 0.001 + node.phase) * 0.45 + 0.55;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r + pulse * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(128, 200, 255, ${0.16 + pulse * 0.16})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(node.x, node.y, Math.max(0.8, node.r * 0.45), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(248, 252, 255, ${0.22 + pulse * 0.24})`;
    ctx.fill();
  }

  function drawLinks() {
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > config.linkDistance) continue;
        const alpha = (1 - distance / config.linkDistance) * 0.16;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(18, 62, 122, ${alpha})`;
        ctx.lineWidth = 1; ctx.stroke();
      }
      if (pointer.active) {
        const distance = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (distance < config.pointerDistance) {
          const alpha = (1 - distance / config.pointerDistance) * 0.22;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(85, 184, 255, ${alpha})`;
          ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
  }

  function updateNodes() {
    nodes.forEach((node) => {
      node.x += node.vx; node.y += node.vy;
      if (node.x < -20) node.x = width + 20;
      if (node.x > width + 20) node.x = -20;
      if (node.y < -20) node.y = height + 20;
      if (node.y > height + 20) node.y = -20;
    });
  }

  function frame(time) {
    ctx.clearRect(0, 0, width, height);
    drawGrid(); drawLinks(); nodes.forEach((node) => drawNode(node, time)); updateNodes();
    rafId = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => { pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true; }, { passive: true });
  window.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(rafId); else rafId = requestAnimationFrame(frame); });
  resize(); rafId = requestAnimationFrame(frame);
})();

(() => {
  const target = document.querySelector('[data-title-neural]');
  if (!target) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const pointer = { x: 0, y: 0, active: false };
  let nodes = [];
  let rafId = 0;
  let lastTexture = 0;
  let width = 900;
  let height = 180;

  function makeNode() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.62,
      vy: (Math.random() - 0.5) * 0.62,
      r: 1.15 + Math.random() * 2.25,
      phase: Math.random() * Math.PI * 2,
      pull: 0.45 + Math.random() * 0.75
    };
  }

  function resize() {
    const rect = target.getBoundingClientRect();
    width = Math.max(420, Math.floor(rect.width * 1.24));
    height = Math.max(140, Math.floor(rect.height * 1.72));
    canvas.width = width;
    canvas.height = height;
    nodes = Array.from({ length: Math.max(48, Math.min(76, Math.floor(width / 13))) }, makeNode);
    draw(performance.now(), true);
  }

  function updatePointer(event) {
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.x = (event.clientX - rect.left) * (width / rect.width);
    pointer.y = (event.clientY - rect.top) * (height / rect.height);
    pointer.active = true;
  }

  function drawConnections() {
    const lineDistance = Math.min(172, width * .22);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > lineDistance) continue;
        const alpha = (1 - d / lineDistance) * .48;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(122, 213, 255, ${alpha})`;
        ctx.lineWidth = .9;
        ctx.stroke();
      }

      if (pointer.active) {
        const d = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        const pointerLineDistance = Math.min(240, width * .32);
        if (d < pointerLineDistance) {
          const alpha = (1 - d / pointerLineDistance) * .55;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(238, 248, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function drawNodes(time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    nodes.forEach((node) => {
      const pulse = Math.sin(time * .0035 + node.phase) * .5 + .5;
      const glowRadius = node.r * (4.2 + pulse * 2.4);
      const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
      glow.addColorStop(0, `rgba(255, 255, 255, ${.72 + pulse * .18})`);
      glow.addColorStop(.25, `rgba(142, 219, 255, ${.38 + pulse * .26})`);
      glow.addColorStop(1, 'rgba(74, 170, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r + pulse * .85, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(250, 254, 255, ${.76 + pulse * .22})`;
      ctx.fill();
    });
    ctx.restore();
  }

  function updateNodes() {
    nodes.forEach((node) => {
      if (pointer.active) {
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const distance = Math.max(18, Math.hypot(dx, dy));
        const influence = Math.max(0, 1 - distance / Math.max(width, height));
        const force = 0.0028 * node.pull * (0.35 + influence);
        node.vx += dx * force;
        node.vy += dy * force;
      }

      node.vx *= pointer.active ? 0.91 : 0.982;
      node.vy *= pointer.active ? 0.91 : 0.982;
      const speed = Math.hypot(node.vx, node.vy);
      const maxSpeed = pointer.active ? 4.1 : 1.1;
      if (speed > maxSpeed) {
        node.vx = (node.vx / speed) * maxSpeed;
        node.vy = (node.vy / speed) * maxSpeed;
      }

      node.x += node.vx;
      node.y += node.vy;

      if (node.x < -18) node.x = width + 18;
      if (node.x > width + 18) node.x = -18;
      if (node.y < -18) node.y = height + 18;
      if (node.y > height + 18) node.y = -18;
    });
  }

  function draw(time, forceTexture = false) {
    ctx.clearRect(0, 0, width, height);

    const deep = ctx.createLinearGradient(0, 0, width, height);
    deep.addColorStop(0, 'rgba(7, 27, 56, .9)');
    deep.addColorStop(.48, 'rgba(18, 62, 122, .78)');
    deep.addColorStop(1, 'rgba(4, 15, 32, .94)');
    ctx.fillStyle = deep;
    ctx.fillRect(0, 0, width, height);

    const aura = ctx.createRadialGradient(width * .58, height * .48, 0, width * .58, height * .48, width * .6);
    aura.addColorStop(0, 'rgba(45, 116, 205, .26)');
    aura.addColorStop(.42, 'rgba(42, 91, 177, .12)');
    aura.addColorStop(1, 'rgba(7, 27, 56, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);

    drawConnections();
    drawNodes(time);
    if (!prefersReducedMotion) updateNodes();

    if (forceTexture || time - lastTexture > 55) {
      target.style.setProperty('--title-neural-texture', `url(${canvas.toDataURL('image/png')})`);
      lastTexture = time;
    }
  }

  function frame(time) {
    draw(time);
    rafId = requestAnimationFrame(frame);
  }

  target.addEventListener('pointerenter', updatePointer, { passive: true });
  target.addEventListener('pointermove', updatePointer, { passive: true });
  target.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  target.addEventListener('blur', () => { pointer.active = false; }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else if (!prefersReducedMotion) rafId = requestAnimationFrame(frame);
  });

  resize();
  if (!prefersReducedMotion) rafId = requestAnimationFrame(frame);
})();
