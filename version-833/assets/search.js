(function () {
  var form = document.getElementById('searchForm');
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var stats = document.getElementById('searchStats');
  var index = window.SEARCH_INDEX || [];

  if (!form || !input || !results) {
    return;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '          <span>' + escapeHtml(tag) + '</span>';
    }).join('\n');

    return [
      '      <article class="movie-card">',
      '        <a class="movie-poster" href="' + escapeHtml(movie.url) + '">',
      '          <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '          <span class="movie-badge">' + escapeHtml(movie.type) + '</span>',
      '        </a>',
      '        <div class="movie-card-body">',
      '          <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '          <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '          <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
      '          <div class="tag-row">',
      tags,
      '          </div>',
      '        </div>',
      '      </article>'
    ].join('\n');
  }

  function render(query) {
    var normalized = query.trim().toLowerCase();
    var matched = index;

    if (normalized) {
      matched = index.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          movie.tags.join(' ')
        ].join(' ').toLowerCase();

        return haystack.indexOf(normalized) !== -1;
      });
    }

    matched = matched.slice(0, 120);

    if (stats) {
      stats.textContent = normalized ? '匹配到 ' + matched.length + ' 条结果' : '热门推荐';
    }

    if (!matched.length) {
      results.innerHTML = '<p class="search-stats">没有找到匹配影片</p>';
      return;
    }

    results.innerHTML = matched.map(card).join('\n');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render(input.value);
  });

  input.addEventListener('input', function () {
    render(input.value);
  });

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  if (initial) {
    input.value = initial;
  }

  render(input.value);
}());
