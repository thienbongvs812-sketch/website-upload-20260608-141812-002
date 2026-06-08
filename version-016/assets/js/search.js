(function () {
  const input = document.querySelector('[data-search-input]');
  const title = document.querySelector('[data-search-title]');
  const results = document.querySelector('[data-search-results]');
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();

  const escapeHtml = function (value) {
    return String(value).replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[match];
    });
  };

  const card = function (movie) {
    return '<article class="movie-card">' +
      '<a class="movie-cover" href="' + movie.href + '" aria-label="' + escapeHtml(movie.title) + '">' +
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="movie-region">' + escapeHtml(movie.region) + '</span>' +
        '<span class="movie-type">' + escapeHtml(movie.type) + '</span>' +
        '<span class="movie-play-icon">▶</span>' +
      '</a>' +
      '<div class="movie-info">' +
        '<h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="movie-meta"><span>★ ' + movie.score + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
      '</div>' +
    '</article>';
  };

  const render = function () {
    const keyword = query.toLowerCase();
    let list = [];

    if (keyword) {
      list = MOVIE_INDEX.filter(function (movie) {
        return movie.searchText.includes(keyword);
      }).slice(0, 96);
      title.textContent = '搜索：' + query;
    } else {
      list = MOVIE_INDEX.slice(0, 48);
      title.textContent = '热门内容';
    }

    if (input) {
      input.value = query;
    }

    if (!list.length) {
      results.innerHTML = '<div class="empty-state"><h2>未找到相关内容</h2><p>可以尝试更换片名、年份、类型或地区关键词。</p></div>';
      return;
    }

    results.innerHTML = list.map(card).join('');
  };

  if (results && Array.isArray(MOVIE_INDEX)) {
    render();
  }
})();
