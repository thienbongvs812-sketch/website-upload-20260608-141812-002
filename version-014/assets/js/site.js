var MovieSite = (function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
        show(next);
        restart();
      });
    });

    show(0);
    start();
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var select = document.querySelector("[data-local-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-container] .movie-card"));
    if (!cards.length || (!input && !select)) {
      return;
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var type = select ? select.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var genre = (card.getAttribute("data-genre") || "").toLowerCase();
        var region = (card.getAttribute("data-region") || "").toLowerCase();
        var movieType = (card.getAttribute("data-type") || "").toLowerCase();
        var textMatch = !keyword || title.indexOf(keyword) >= 0 || genre.indexOf(keyword) >= 0 || region.indexOf(keyword) >= 0 || movieType.indexOf(keyword) >= 0;
        var typeMatch = !type || genre.indexOf(type) >= 0 || title.indexOf(type) >= 0 || region.indexOf(type) >= 0 || movieType.indexOf(type) >= 0;
        card.style.display = textMatch && typeMatch ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (select) {
      select.addEventListener("change", applyFilter);
    }
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    if (!results || !window.MovieIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }

    function render(items, label) {
      if (title) {
        title.textContent = label;
      }
      results.innerHTML = items.map(function (item, index) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
          "<article class=\"movie-card\">",
          "<a class=\"poster-link\" href=\"./" + item.url + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
          "<img src=\"./" + item.cover + ".jpg\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
          "<span class=\"play-chip\">播放</span>",
          "</a>",
          "<div class=\"card-body\">",
          "<div class=\"card-meta\">" + escapeHtml(item.year + " · " + item.region + " · " + item.type) + "</div>",
          "<h2><a href=\"./" + item.url + "\">" + escapeHtml(item.title) + "</a></h2>",
          "<p>" + escapeHtml(item.oneLine) + "</p>",
          "<div class=\"tag-row\">" + tags + "</div>",
          "</div>",
          "</article>"
        ].join("");
      }).join("");
    }

    function search() {
      var q = query.toLowerCase();
      if (!q) {
        render(window.MovieIndex.slice(0, 60), "热门内容");
        return;
      }
      var matched = window.MovieIndex.filter(function (item) {
        var text = [item.title, item.oneLine, item.region, item.type, item.year, item.genre, item.category, item.tags.join(" ")].join(" ").toLowerCase();
        return text.indexOf(q) >= 0;
      }).slice(0, 120);
      render(matched, "与“" + query + "”相关的内容");
    }

    search();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initPlayer(source) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var layer = document.getElementById("play-layer");
      if (!video || !source) {
        return;
      }

      function attach() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        video.setAttribute("data-ready", "1");
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              video.src = source;
            }
          });
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        if (layer) {
          layer.classList.add("hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (layer) {
        layer.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (layer) {
          layer.classList.add("hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (layer && video.currentTime === 0) {
          layer.classList.remove("hidden");
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });

  return {
    initPlayer: initPlayer
  };
})();
