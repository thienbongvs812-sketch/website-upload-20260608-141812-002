(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initScrollers() {
    document.querySelectorAll("[data-scroll-prev]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-prev"));
        if (target) {
          target.scrollBy({ left: -420, behavior: "smooth" });
        }
      });
    });
    document.querySelectorAll("[data-scroll-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-next"));
        if (target) {
          target.scrollBy({ left: 420, behavior: "smooth" });
        }
      });
    });
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-zone]").forEach(function (zone) {
      var section = zone.closest("section") || document;
      var input = zone.querySelector(".filter-input");
      var selects = Array.prototype.slice.call(zone.querySelectorAll(".filter-select"));
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-filter-card]"));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute("data-filter-field")] = select.value;
        });
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-type") || ""
          ].join(" ").toLowerCase();
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedYear = !filters.year || (card.getAttribute("data-year") || "") === filters.year;
          var matchedType = !filters.type || (card.getAttribute("data-type") || "").indexOf(filters.type) !== -1;
          card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear && matchedType));
        });
      }

      if (input) {
        var query = getQueryValue("q");
        if (query) {
          input.value = query;
        }
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initScrollers();
    initFilters();
  });
})();

function setupMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-video");
  var layer = document.getElementById("play-layer");
  var shell = video ? video.closest(".player-shell") : null;
  var attached = false;
  var hlsInstance = null;

  function attach() {
    if (!video || attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    if (!video) {
      return;
    }
    attach();
    if (shell) {
      shell.classList.add("is-playing");
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        video.addEventListener("canplay", function () {
          video.play().catch(function () {});
        }, { once: true });
      });
    }
  }

  if (layer) {
    layer.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });
    video.addEventListener("pause", function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
}
