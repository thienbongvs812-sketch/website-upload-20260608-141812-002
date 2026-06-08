(() => {
  const mobileButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');
  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    if (prev) {
      prev.addEventListener('click', () => {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(index + 1);
        restart();
      });
    }

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  const params = new URLSearchParams(window.location.search);
  const keyword = (params.get('q') || '').trim();
  const searchInput = document.querySelector('.large-search input[name="q"]');
  const searchSummary = document.querySelector('[data-search-summary]');
  const cards = Array.from(document.querySelectorAll('[data-search-grid] [data-card]'));

  if (searchInput && keyword) {
    searchInput.value = keyword;
  }

  if (cards.length) {
    const normalized = keyword.toLowerCase();
    let visibleCount = 0;
    cards.forEach((card) => {
      const text = `${card.dataset.title || ''} ${card.dataset.meta || ''}`.toLowerCase();
      const matched = !normalized || text.includes(normalized);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visibleCount += 1;
      }
    });
    if (searchSummary) {
      searchSummary.textContent = normalized ? `搜索结果：${keyword}，共 ${visibleCount} 部` : `全部片库，共 ${visibleCount} 部`;
    }
  }

  const player = document.querySelector('[data-player]');
  const playButton = document.querySelector('[data-play]');

  if (player && playButton) {
    let started = false;
    let hlsInstance = null;

    const start = () => {
      const streamUrl = player.getAttribute('data-url');
      if (!streamUrl) {
        return;
      }

      if (!started) {
        if (player.canPlayType('application/vnd.apple.mpegurl')) {
          player.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(player);
        } else {
          player.src = streamUrl;
        }
        started = true;
      }

      playButton.hidden = true;
      player.controls = true;
      const playPromise = player.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          playButton.hidden = false;
        });
      }
    };

    playButton.addEventListener('click', start);
    player.addEventListener('click', () => {
      if (!started || player.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
