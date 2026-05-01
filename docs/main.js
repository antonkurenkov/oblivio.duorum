(() => {
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('[data-progress]');
  const year = document.querySelector('[data-year]');
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const dialog = document.querySelector('[data-dialog]');
  const dialogImage = document.querySelector('[data-dialog-image]');
  const dialogClose = document.querySelector('[data-dialog-close]');
  const chapterGallery = document.querySelector('[data-chapter-gallery]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));

  const chapterTitles = [
    'Apocryphum',
    'Silentium',
    'Dispersae',
    'Absentiae',
    'Custodes Pallidi',
    'Custodes Viarum',
    'Vix Fuit',
    'Oblivio Memoriae',
    'Vas Haeresis',
    'Archivarium',
    'Testimonium',
    'Contra Scriptum',
    'Relicta',
    'Numeri Absentium',
    'Porta',
    'Noli Separare',
    'Concordantia',
    'Finis'
  ];

  const chapterExtensions = ['jpg', 'png', 'webp', 'jpeg'];

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function padNumber(value) {
    return String(value).padStart(2, '0');
  }

  function chapterGroup(index) {
    if (index <= 6) return 'early';
    if (index <= 12) return 'middle';
    return 'late';
  }

  function createChapterCard(index) {
    const number = padNumber(index);
    const title = chapterTitles[index - 1] || `Capitulum ${number}`;
    const initialSrc = `assets/chapters/${number}.${chapterExtensions[0]}`;

    const figure = document.createElement('figure');
    figure.className = 'chapter-card reveal';
    figure.dataset.group = chapterGroup(index);

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Открыть титульник главы ${number}`);

    const img = document.createElement('img');
    img.src = initialSrc;
    img.alt = `Титульное изображение главы ${number}: ${title}`;
    img.loading = 'lazy';
    img.dataset.base = `assets/chapters/${number}`;
    img.dataset.extensionIndex = '0';

    img.addEventListener('error', () => {
      const currentIndex = Number(img.dataset.extensionIndex || 0);
      const nextIndex = currentIndex + 1;

      if (nextIndex >= chapterExtensions.length) {
        figure.remove();
        return;
      }

      img.dataset.extensionIndex = String(nextIndex);
      img.src = `${img.dataset.base}.${chapterExtensions[nextIndex]}`;
    });

    img.addEventListener('load', () => {
      button.dataset.image = img.currentSrc || img.src;
    });

    button.addEventListener('click', () => {
      openImage(button.dataset.image || img.currentSrc || img.src, img.alt);
    });

    const caption = document.createElement('figcaption');
    caption.innerHTML = `<span>${number}</span><span>${title}</span>`;

    button.appendChild(img);
    figure.appendChild(button);
    figure.appendChild(caption);

    return figure;
  }

  function renderChapterGallery() {
    if (!chapterGallery) return;

    const fragment = document.createDocumentFragment();

    for (let index = 1; index <= 18; index += 1) {
      fragment.appendChild(createChapterCard(index));
    }

    chapterGallery.innerHTML = '';
    chapterGallery.appendChild(fragment);

    observeReveals(Array.from(chapterGallery.querySelectorAll('.reveal')));
  }

  function applyChapterFilter(filter) {
    const cards = Array.from(document.querySelectorAll('.chapter-card'));

    cards.forEach((card) => {
      const visible = filter === 'all' || card.dataset.group === filter;
      card.classList.toggle('is-hidden', !visible);
    });

    filterButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.filter === filter);
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyChapterFilter(button.dataset.filter);
    });
  });

  function updateScrollState() {
    const y = window.scrollY || 0;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) {
      progress.style.width = `${docHeight > 0 ? (y / docHeight) * 100 : 0}%`;
    }

    if (header) {
      header.classList.toggle('is-compact', y > 24);
    }
  }

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function updateActiveNav() {
    const marker = window.scrollY + window.innerHeight * 0.28;
    let activeId = '';

    sections.forEach((section) => {
      if (section.offsetTop <= marker) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`);
    });
  }

  let revealObserver = null;

  function observeReveals(items) {
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08
      });
    }

    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
      revealObserver.observe(item);
    });
  }

  function openImage(src, alt = '') {
    if (!src) return;

    if (!dialog || !dialogImage || typeof dialog.showModal !== 'function') {
      window.open(src, '_blank', 'noopener,noreferrer');
      return;
    }

    dialogImage.src = src;
    dialogImage.alt = alt;
    dialog.showModal();
  }

  document.querySelectorAll('[data-image]').forEach((button) => {
    button.addEventListener('click', () => {
      const preview = button.querySelector('img');
      openImage(button.dataset.image, preview ? preview.alt : '');
    });
  });

  if (dialogClose && dialog && dialogImage) {
    const closeDialog = () => {
      dialog.close();
      dialogImage.removeAttribute('src');
      dialogImage.alt = '';
    };

    dialogClose.addEventListener('click', closeDialog);

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        closeDialog();
      }
    });

    dialog.addEventListener('cancel', () => {
      dialogImage.removeAttribute('src');
      dialogImage.alt = '';
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  });

  window.addEventListener('scroll', () => {
    updateScrollState();
    updateActiveNav();
  }, { passive: true });

  renderChapterGallery();
  observeReveals(revealItems);
  updateScrollState();
  updateActiveNav();
})();