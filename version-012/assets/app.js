(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            menuButton.textContent = mobileNav.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilter() {
        var search = document.querySelector('.movie-search');
        var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var currentChip = 'all';

        if (!search && !chips.length) {
            return;
        }

        function apply() {
            var query = search ? search.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var filter = (card.getAttribute('data-filter') || '').toLowerCase();
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesChip = currentChip === 'all' || filter.indexOf(currentChip.toLowerCase()) !== -1 || text.indexOf(currentChip.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(matchesQuery && matchesChip));
            });
        }

        if (search) {
            search.addEventListener('input', apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                currentChip = chip.getAttribute('data-chip') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                apply();
            });
        });

        apply();
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));

        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.player-start');
            var stream = video ? video.getAttribute('data-stream') : '';
            var started = false;
            var hlsInstance = null;

            function attachAndPlay() {
                if (!video || !stream) {
                    return;
                }

                if (!started) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(stream);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                    started = true;
                }

                video.controls = true;
                if (button) {
                    button.classList.add('is-hidden');
                }
                video.play().catch(function () {});
            }

            if (button) {
                button.addEventListener('click', attachAndPlay);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        attachAndPlay();
                    }
                });
                video.addEventListener('ended', function () {
                    if (hlsInstance && hlsInstance.destroy) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupFilter();
        setupPlayers();
    });
})();
