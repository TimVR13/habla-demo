// Public pages: example audio and the small test widget. No dependencies.
(function () {

  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var h = function (tag, cls, text) { var el = document.createElement(tag); if (cls) el.className = cls; if (text != null) el.textContent = text; return el; };

  // Items: [prompt with ___, answer, options, hint, explanation, level?, tricky?]
  document.querySelectorAll('[data-quiz]').forEach(function (box) {
    var all = JSON.parse(box.querySelector('script[type="application/json"]').textContent);
    var cta = box.getAttribute('data-cta');
    var article = box.hasAttribute('data-article');
    var LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
    var mine = null;
    try { mine = JSON.parse(localStorage.getItem('habla-state-v1') || 'null').level; } catch (e) { /* no saved course progress */ }
    var filter = article ? (LEVELS.indexOf(mine) >= 0 ? mine : mine === 'C2' ? 'C1' : 'A1') : null;
    var round, i, score;
    var pool = function () {
      if (!article) return all;
      if (filter === 'tricky') return all.filter(function (x) { return x[6]; });
      return all.filter(function (x) { return x[5] === filter; });
    };
    var start = function () { round = shuffle(pool()).slice(0, 10); i = 0; score = 0; show(); };
    var show = function () {
      box.querySelectorAll(':scope > :not(script)').forEach(function (x) { x.remove(); });
      if (i >= round.length) {
        box.appendChild(h('p', 'q-prompt', 'Верно ' + score + ' из ' + round.length));
        box.appendChild(h('p', null, score >= 8 ? '¡Muy bien! Тема освоена.' : 'Повторите правило выше и попробуйте ещё раз — задания будут другими.'));
        var row = h('div', 'q-end');
        var again = h('button', 'btn', 'Ещё 10 заданий'); again.onclick = start; row.appendChild(again);
        var go = h('a', 'btn ghost', 'Перейти к курсу'); go.href = cta; row.appendChild(go);
        box.appendChild(row);
        return;
      }
      var it = round[i];
      var bar = h('div', 'q-bar'); var fill = h('i'); fill.style.width = (i / round.length) * 100 + '%'; bar.appendChild(fill); box.appendChild(bar);
      var p = h('p', 'q-prompt'); p.lang = 'es';
      var parts = it[0].split('___');
      p.appendChild(document.createTextNode(parts[0]));
      // A prompt without a gap (a word to translate, a question) is shown as is.
      var gap = parts.length > 1 ? h('span', 'q-gap', '…') : h('span');
      if (parts.length > 1) p.appendChild(gap);
      if (parts[1]) p.appendChild(document.createTextNode(parts[1]));
      box.appendChild(p);
      box.appendChild(h('p', 'muted', it[3]));
      var opts = h('div', 'q-opts');
      var fb = h('div', 'q-fb'); fb.hidden = true;
      var next = h('button', 'btn', i + 1 < round.length ? 'Дальше' : 'Результат'); next.hidden = true;
      next.onclick = function () { i++; show(); };
      shuffle(it[2]).forEach(function (o) {
        var b = h('button', null, o);
        b.lang = 'es';
        b.onclick = function () {
          var ok = o === it[1];
          if (ok) score++;
          opts.querySelectorAll('button').forEach(function (x) { x.disabled = true; if (x.textContent === it[1]) x.className = 'right'; else if (x === b) x.className = 'wrong'; });
          if (parts.length > 1) gap.textContent = it[1];
          fb.hidden = false;
          fb.textContent = (ok ? '¡Correcto! ' : 'Правильно: ' + it[1] + '. ') + (it[4] || '');
          next.hidden = false;
          next.focus();
        };
        opts.appendChild(b);
      });
      box.appendChild(opts); box.appendChild(fb); box.appendChild(next);
    };
    var card = box.closest('.quiz-card');
    var seg = card && card.querySelector('.seg');
    var label = card && card.querySelector('[data-level-label]');
    var mark = function () {
      if (!seg) return;
      seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-level') === filter)); });
      if (label) label.textContent = filter === 'tricky' ? 'коварные слова' : filter;
    };
    if (seg) seg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-level]'); if (!b) return;
      filter = b.getAttribute('data-level');
      mark();
      var d = b.closest('details'); if (d) d.open = false;
      start();
    });
    mark();
    start();
  });
})();
