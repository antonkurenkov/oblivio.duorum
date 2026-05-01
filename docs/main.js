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
  const emptyGalleryNote = document.querySelector('[data-empty-gallery]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));

  const chapterEntries = [
    {
      file: '01',
      mark: 'APOCRYPHUM',
      latin: 'De numeris absentium',
      title: 'Apocryphum: De numeris absentium',
      ru: 'Апокриф о числах отсутствующих',
      group: 'early'
    },
    {
      file: '02',
      mark: 'I',
      latin: 'Dispersae Reliquiae',
      title: 'Dispersae Reliquiae',
      ru: 'Технический мусор',
      group: 'early'
    },
    {
      file: '03',
      mark: 'II',
      latin: 'Silentium Impositum',
      title: 'Silentium Impositum',
      ru: 'Обет молчания',
      group: 'early'
    },
    {
      file: '04',
      mark: 'III',
      latin: 'Absentiae Scriptura',
      title: 'Absentiae Scriptura',
      ru: 'Почерк отсутствия',
      group: 'early'
    },
    {
      file: '05',
      mark: 'IV',
      latin: 'Custodes Pallidi',
      title: 'Custodes Pallidi',
      ru: 'Бледный Дозор',
      group: 'early'
    },
    {
      file: '06',
      mark: 'V',
      latin: 'Custodes Viarum',
      title: 'Custodes Viarum',
      ru: 'Хранители Пути',
      group: 'early'
    },
    {
      file: '07',
      mark: 'VI',
      latin: 'Vix Fuit',
      title: 'Vix Fuit',
      ru: 'То, чего не должно быть',
      group: 'middle'
    },
    {
      file: '08',
      mark: 'VII',
      latin: 'Limes Imperii',
      title: 'Limes Imperii',
      ru: 'Имперский предел',
      group: 'middle'
    },
    {
      file: '09',
      mark: 'VIII',
      latin: 'Monolithus Ymgi',
      title: 'Monolithus Ymgi',
      ru: 'Монолит Имги',
      group: 'middle'
    },
    {
      file: '10',
      mark: 'IX',
      latin: 'Respira',
      title: 'Respira',
      ru: 'Дыши',
      group: 'middle'
    },
    {
      file: '11',
      mark: 'X',
      latin: 'Schema Divisum',
      title: 'Schema Divisum',
      ru: 'Чертёж',
      group: 'middle'
    },
    {
      file: '12',
      mark: 'XI',
      latin: 'Via Falsa',
      title: 'Via Falsa',
      ru: 'Ложный маршрут',
      group: 'middle'
    },
    {
      file: '13',
      mark: 'XII',
      latin: 'Malum',
      title: 'Malum',
      ru: 'Malum',
      group: 'late'
    },
    {
      file: '14',
      mark: 'XIII',
      latin: 'Arcus Vetrá',
      title: 'Arcus Vetrá',
      ru: 'Арка Ветра́',
      group: 'late'
    },
    {
      file: '15',
      mark: 'XIV',
      latin: 'Colloquium Extremum',
      title: 'Colloquium Extremum',
      ru: 'Последний разговор',
      group: 'late'
    },
    {
      file: '16',
      mark: 'XV',
      latin: 'Vestigia Duorum',
      title: 'Vestigia Duorum',
      ru: 'Пепел двух',
      group: 'late'
    },
    {
      file: '17',
      mark: 'XVI',
      latin: 'Oblivio memoriae',
      title: 'Oblivio memoriae',
      ru: 'Забвение памяти',
      group: 'late'
    },
    {
      file: '18',
      mark: 'FINIS',
      latin: 'Vas Haeresis',
      title: 'Vas Haeresis',
      ru: 'Контейнер ереси',
      group: 'late'
    }
  ];

  const chapterExtensions = ['jpg', 'png', 'webp', 'jpeg'];
  let loadedChapterImages = 0;
  let revealObserver = null;

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function updateEmptyGalleryState() {
    if (!emptyGalleryNote) return;
    emptyGalleryNote.hidden = loadedChapterImages > 0;
  }

  function createChapterCard(entry) {
    const initialSrc = `assets/chapters/${entry.file}.${chapterExtensions[0]}`;

    const figure = document.createElement('figure');
    figure.className = 'chapter-card reveal';
    figure.dataset.group = entry.group;

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Открыть титульник: ${entry.title}`);

    const img = document.createElement('img');
    img.src = initialSrc;
    img.alt = `Титульное изображение: ${entry.title} / ${entry.ru}`;
    img.loading = 'lazy';
    img.dataset.base = `assets/chapters/${entry.file}`;
    img.dataset.extensionIndex = '0';

    img.addEventListener('error', () => {
      const currentIndex = Number(img.dataset.extensionIndex || 0);
      const nextIndex = currentIndex + 1;

      if (nextIndex >= chapterExtensions.length) {
        figure.remove();
        updateEmptyGalleryState();
        return;
      }

      img.dataset.extensionIndex = String(nextIndex);
      img.src = `${img.dataset.base}.${chapterExtensions[nextIndex]}`;
    });

    img.addEventListener('load', () => {
      loadedChapterImages += 1;
      button.dataset.image = img.currentSrc || img.src;
      updateEmptyGalleryState();
    }, { once: true });

    button.addEventListener('click', () => {
      openImage(button.dataset.image || img.currentSrc || img.src, img.alt);
    });

    const caption = document.createElement('figcaption');
    caption.innerHTML = `
      <span class="chapter-mark">${entry.mark}</span>
      <span class="chapter-name">
        <strong>${entry.latin}</strong>
        <em>${entry.ru}</em>
      </span>
    `;

    button.appendChild(img);
    figure.appendChild(button);
    figure.appendChild(caption);

    return figure;
  }

  function renderChapterGallery() {
    if (!chapterGallery) return;

    const fragment = document.createDocumentFragment();

    chapterEntries.forEach((entry) => {
      fragment.appendChild(createChapterCard(entry));
    });

    chapterGallery.innerHTML = '';
    chapterGallery.appendChild(fragment);
    updateEmptyGalleryState();
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