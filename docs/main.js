(() => {
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('[data-progress]');
  const year = document.querySelector('[data-year]');
  const navLinks = [...document.querySelectorAll('.nav a')];
  const revealItems = [...document.querySelectorAll('.reveal')];
  const dialog = document.querySelector('[data-dialog]');
  const dialogImage = document.querySelector('[data-dialog-image]');
  const dialogClose = document.querySelector('[data-dialog-close]');

  if (year) year.textContent = new Date().getFullYear();

  function updateScrollState() {
    const y = window.scrollY || 0;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${docHeight > 0 ? (y / docHeight) * 100 : 0}%`;
    if (header) header.classList.toggle('is-compact', y > 24);
  }

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function updateActiveNav() {
    const marker = window.scrollY + window.innerHeight * 0.28;
    let activeId = '';
    sections.forEach((section) => {
      if (section.offsetTop <= marker) activeId = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`);
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('.gallery-item').forEach((button) => {
    button.addEventListener('click', () => {
      if (!dialog || !dialogImage) return;
      dialogImage.src = button.dataset.image;
      if (typeof dialog.showModal === 'function') dialog.showModal();
    });
  });

  if (dialogClose && dialog) {
    dialogClose.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      const clickedOutside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (clickedOutside) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (dialogImage) dialogImage.removeAttribute('src');
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
  });

  window.addEventListener('scroll', () => {
    updateScrollState();
    updateActiveNav();
  }, { passive: true });

  updateScrollState();
  updateActiveNav();
})();
