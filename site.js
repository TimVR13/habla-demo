// Public pages: example audio and the small test widget. No dependencies.
(function () {
  var es = function (t) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.lang = 'es-ES';
    u.rate = 0.9;
    speechSynthesis.speak(u);
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-say]');
    if (b) es(b.getAttribute('data-say'));
  });

  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var h = function (tag, cls, text) { var el = document.createElement(tag); if (cls) el.className = cls; if (text != null) el.textContent = text; return el; };

  // Items: [prompt with ___, answer, options, hint, explanation, level?, tricky?]
  document.querySelectorAll('[data-quiz]').forEach(function (box) {
    var all = JSON.parse(box.querySelector('script[type="application/json"]').textContent);
    var cta = box.getAttribute('data-cta');
    var article = box.hasAttribute('data-article');
    var filter = article ? 'A1' : null;
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
        var again = h('button', 'btn', 'Ещё 10 заданий'); again.onclick = start; box.appendChild(again);
        var go = h('a', 'btn ghost', 'Учить дальше в приложении'); go.href = cta; go.style.marginLeft = '8px'; box.appendChild(go);
        return;
      }
      var it = round[i];
      var bar = h('div', 'q-bar'); var fill = h('i'); fill.style.width = (i / round.length) * 100 + '%'; bar.appendChild(fill); box.appendChild(bar);
      var p = h('p', 'q-prompt'); p.lang = 'es';
      var parts = it[0].split('___');
      p.appendChild(document.createTextNode(parts[0]));
      var gap = h('span', 'q-gap', '…'); p.appendChild(gap);
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
          gap.textContent = it[1];
          fb.hidden = false;
          fb.textContent = (ok ? '¡Correcto! ' : 'Правильно: ' + it[1] + '. ') + (it[4] || '');
          next.hidden = false;
          es(it[0].replace('___', it[1]));
          next.focus();
        };
        opts.appendChild(b);
      });
      box.appendChild(opts); box.appendChild(fb); box.appendChild(next);
    };
    var seg = box.parentElement.querySelector('.seg');
    if (seg) seg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-level]'); if (!b) return;
      filter = b.getAttribute('data-level');
      seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      start();
    });
    start();
  });
})();
