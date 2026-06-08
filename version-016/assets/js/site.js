(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let active = 0;
    let timer = null;

    const show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  const panels = document.querySelectorAll('[data-filter-panel]');

  panels.forEach(function (panel) {
    const input = panel.querySelector('[data-filter-input]');
    const list = panel.parentElement.querySelector('[data-filter-list]');
    const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];
    let activeYear = '';
    let activeType = '';

    const run = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre
        ].join(' ').toLowerCase();
        const okKeyword = !keyword || text.includes(keyword);
        const okYear = !activeYear || card.dataset.year === activeYear;
        const okType = !activeType || card.dataset.type === activeType;
        card.classList.toggle('is-hidden', !(okKeyword && okYear && okType));
      });
    };

    if (input) {
      input.addEventListener('input', run);
    }

    panel.querySelectorAll('[data-filter-year]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year') || '';
        panel.querySelectorAll('[data-filter-year]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        run();
      });
    });

    panel.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-type') || '';
        panel.querySelectorAll('[data-filter-type]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        run();
      });
    });
  });
})();
