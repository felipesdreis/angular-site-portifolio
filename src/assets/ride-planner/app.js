const $ = s => document.querySelector(s);
const coarse = matchMedia('(pointer: coarse)').matches;
const km = (m, d = 1) => (m / 1000).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

const map = L.map('map', { zoomControl: false }).setView([-22.37, -46.94], 13);
L.control.zoom({ zoomInTitle: 'Aumentar zoom', zoomOutTitle: 'Diminuir zoom' }).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
// Contorno #0F7C41 (4.6:1 sobre o mapa) por baixo da linha na cor primária: contraste não-texto ≥ 3:1 (WCAG 1.4.11).
const casing = L.polyline([], { color: '#0F7C41', weight: 9, interactive: false }).addTo(map);
const line = L.polyline([], { color: '#1EA767', weight: 5, bubblingMouseEvents: false }).addTo(map);
const marks = L.layerGroup().addTo(map);
const kmMarks = L.layerGroup().addTo(map);
const dot = L.circleMarker([0, 0], { radius: 7, color: '#fff', weight: 2, fillColor: '#CE5BA4', fillOpacity: 1 });

// Estado: waypoints [lat,lon] e segmentos {m: modo, pts: [[lat,lon,ele],...]} entre waypoints consecutivos.
let { wps = [], segs = [], mode = 'trekking', name = '' } = JSON.parse(localStorage.ride || '{}');
let hist = [], queue = Promise.resolve(), P = [], D = [], warn = '', refocus = null;

const say = (t, busy) => { const s = $('#status'); s.textContent = t; s.toggleAttribute('data-busy', !!busy) };
const snap = () => { hist.push(JSON.stringify({ wps, segs })); if (hist.length > 50) hist.shift() };
const save = () => localStorage.ride = JSON.stringify({ wps, segs, mode, name: $('#name').value });
// ponytail: fila única serializa todas as edições, assim cliques rápidos não disputam a rede.
const run = fn => {
  say('Calculando rota', true);
  queue = queue.then(fn)
    .catch(e => { console.error(e); warn = 'Algo deu errado, tente de novo' })
    .then(() => { render(); say(warn); warn = '' });
};

async function ele(ps) {
  try {
    const j = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${ps.map(p => p[0])}&longitude=${ps.map(p => p[1])}`).then(r => r.json());
    return ps.map((p, i) => [p[0], p[1], j.elevation[i]]);
  } catch {
    warn = 'Sem dados de elevação, altitude zerada neste trecho';
    return ps.map(p => [p[0], p[1], 0]);
  }
}

// BRouter já devolve elevação em cada ponto; se falhar, cai para linha reta e avisa.
async function route(a, b, m) {
  if (m !== 'straight') {
    try {
      const r = await fetch(`https://brouter.de/brouter?lonlats=${a[1]},${a[0]}|${b[1]},${b[0]}&profile=${m}&alternativeidx=0&format=geojson`);
      if (r.ok) return (await r.json()).features[0].geometry.coordinates.map(([lo, la, e]) => [la, lo, +e || 0]);
    } catch (e) { console.warn(e) }
    warn = 'Roteador indisponível, trecho feito em linha reta';
  }
  return ele([a, b]);
}

// ponytail: histerese de 3 m contra ruído do DEM; trocar por suavização se os números divergirem muito do Strava/Garmin.
function climb(E) {
  let up = 0, down = 0, ref = E[0];
  for (const e of E) { const d = e - ref; if (Math.abs(d) >= 3) { d > 0 ? up += d : down -= d; ref = e } }
  return { up, down };
}
console.assert(climb([0, 2, 5, 4, 10, 0]).up === 10 && climb([0, 2, 5, 4, 10, 0]).down === 10, 'climb');

const add = p => run(async () => {
  snap();
  if (wps.length) {
    const pts = await route(wps.at(-1), p, mode);
    segs.push({ m: mode, pts });
    // encaixa os pontos clicados na rua: usa o início/fim que o roteador devolveu
    wps[wps.length - 1] = pts[0].slice(0, 2);
    p = pts.at(-1).slice(0, 2);
  }
  wps.push(p);
});

const move = (i, ll) => run(async () => {
  snap();
  wps[i] = [ll.lat, ll.lng];
  const [a, b] = await Promise.all([
    i > 0 && route(wps[i - 1], wps[i], segs[i - 1].m),
    i < segs.length && route(wps[i], wps[i + 1], segs[i].m),
  ]);
  if (a) { segs[i - 1].pts = a; wps[i] = a.at(-1).slice(0, 2) }
  if (b) { segs[i].pts = b; wps[i] = b[0].slice(0, 2) }
});

// Divide o segmento k em dois, com um novo waypoint (encaixado na rua) em p.
const insert = (k, ll) => run(async () => {
  snap();
  const p = [ll.lat, ll.lng], m = segs[k].m;
  const [a, b] = await Promise.all([route(wps[k], p, m), route(p, wps[k + 1], m)]);
  wps.splice(k + 1, 0, a.at(-1).slice(0, 2));
  segs.splice(k, 1, { m, pts: a }, { m, pts: b });
});

const remove = i => run(async () => {
  snap();
  if (i === 0) { wps.shift(); segs.shift() }
  else if (i === wps.length - 1) { wps.pop(); segs.pop() }
  else { const m = segs[i - 1].m; wps.splice(i, 1); segs.splice(i - 1, 2, { m, pts: await route(wps[i - 1], wps[i], m) }) }
});

// Arrastar a linha (mouse ou toque): um marcador "fantasma" segue o ponteiro e vira waypoint ao soltar.
let ghost = null;
L.DomEvent.on(line.getElement(), 'pointerdown', e => {
  if (e.button) return;
  L.DomEvent.stop(e);
  map.dragging.disable();
  const at = map.mouseEventToLatLng(e);
  let k = 0, best = Infinity;
  segs.forEach((s, i) => s.pts.forEach(p => { const d = map.distance(p, at); if (d < best) { best = d; k = i } }));
  ghost = L.marker(at, { interactive: false, icon: L.divIcon({ className: 'wp', iconSize: [24, 24] }) }).addTo(map);
  const mv = ev => ghost.setLatLng(map.mouseEventToLatLng(ev));
  document.addEventListener('pointermove', mv);
  document.addEventListener('pointerup', ev => {
    document.removeEventListener('pointermove', mv);
    map.dragging.enable();
    ghost.remove();
    setTimeout(() => ghost = null); // engole o "click" que o navegador dispara logo após soltar
    insert(k, map.mouseEventToLatLng(ev));
  }, { once: true });
});

// Toque/clique/Enter num ponto abre ações: alternativa ao clique direito para toque e teclado.
function popupFor(i) {
  const box = L.DomUtil.create('div', 'pop');
  const btn = (t, f) => { const b = L.DomUtil.create('button', '', box); b.textContent = t; b.onclick = () => { map.closePopup(); f() } };
  if (i === 0 && wps.length > 1) btn('Fechar loop', () => add(wps[0]));
  btn('Remover ponto', () => remove(i));
  return box;
}

function render() {
  P = segs.flatMap((s, i) => i ? s.pts.slice(1) : s.pts);
  D = [0];
  for (let i = 1; i < P.length; i++) D.push(D[i - 1] + map.distance(P[i - 1], P[i]));
  line.setLatLngs(P); casing.setLatLngs(P);

  marks.clearLayers();
  const last = wps.length - 1, size = coarse ? 32 : 24;
  wps.forEach((w, i) => {
    const kind = i === 0 ? 'start' : i === last ? 'end' : '';
    const label = `Ponto ${i + 1} de ${wps.length}${kind === 'start' ? ' (início)' : kind === 'end' ? ' (fim)' : ''}`;
    const m = L.marker(w, { draggable: true, title: label, icon: L.divIcon({ className: 'wp ' + kind, iconSize: [size, size] }) })
      .on('dragend', e => move(i, e.target.getLatLng()))
      .on('contextmenu', () => remove(i))
      .bindPopup(() => popupFor(i))
      .addTo(marks);
    const el = m.getElement();
    el.setAttribute('aria-label', label + '. Setas movem, Delete remove, Enter abre ações.');
    el.onkeydown = e => {
      const b = map.getBounds(), dy = (b.getNorth() - b.getSouth()) / 20, dx = (b.getEast() - b.getWest()) / 20;
      const d = { ArrowUp: [dy, 0], ArrowDown: [-dy, 0], ArrowLeft: [0, -dx], ArrowRight: [0, dx] }[e.key];
      if (d) { e.preventDefault(); refocus = i; move(i, L.latLng(w[0] + d[0], w[1] + d[1])) }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); refocus = Math.max(0, i - 1); remove(i) }
    };
    if (i === refocus) el.focus();
  });
  refocus = null;

  const { up, down } = climb(P.map(p => p[2])), dist = km(D.at(-1)) + ' km';
  $('#dist').textContent = km(D.at(-1));
  $('#chip').textContent = dist;
  $('#up').textContent = Math.round(up);
  $('#down').textContent = Math.round(down);
  // assinatura: marcos de km sobre a rota, no mesmo passo dos ticks do perfil
  kmMarks.clearLayers();
  const ks = kmStep(D.at(-1));
  for (let k = ks, i = 1; k * 1000 < D.at(-1) - ks * 300; k += ks) { // pula o marco colado no fim
    while (D[i] < k * 1000) i++;
    const f = (k * 1000 - D[i - 1]) / (D[i] - D[i - 1] || 1), a = P[i - 1], b = P[i];
    L.marker([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], { interactive: false, keyboard: false,
      icon: L.divIcon({ className: 'km', iconSize: [48, 16], html: `<span>${km(k * 1000, ks < 1 ? 1 : 0)} km</span>` }) }).addTo(kmMarks);
  }
  const sum = P.length < 2 ? 'Rota vazia' : `Distância ${dist}, subida ${Math.round(up)} m, descida ${Math.round(down)} m`;
  if ($('#summary').textContent !== sum) $('#summary').textContent = sum; // só anuncia quando muda

  document.querySelectorAll('#modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === mode));
  $('#mode-name').textContent = $(`#modes [data-m="${mode}"]`).getAttribute('aria-label');
  $('#undo').disabled = !hist.length;
  $('#clear').disabled = !wps.length;
  $('#reverse').disabled = $('#outback').disabled = $('#export').disabled = wps.length < 2;
  $('#need2').textContent = wps.length < 2 ? 'Adicione 2 pontos para inverter, fazer ida e volta e exportar' : '';
  $('#prof').setAttribute('aria-valuemax', Math.round(D.at(-1)));
  save();
  draw();
}

// Perfil de elevação: o "momento" da tela. Grade discreta, rótulos mono, área em degradê do acento, marcos de km.
const nice = (v, steps) => steps.find(s => s >= v) ?? steps.at(-1);
const kmStep = tot => nice(tot / 1000 / 6, [.5, 1, 2, 5, 10, 20, 50, 100]);
const PAD = { l: 52, r: 16, t: 16, b: 28 }, MONO = '12px "JetBrains Mono", ui-monospace, monospace';
function draw(idx) {
  const c = $('#prof'), x = c.getContext('2d'), r = devicePixelRatio, w = c.clientWidth, h = c.clientHeight;
  c.width = w * r; c.height = h * r; x.scale(r, r);
  x.font = '13px Inter, system-ui'; x.fillStyle = '#85858b'; x.textBaseline = 'middle';
  if (P.length < 2) { x.textAlign = 'center'; return x.fillText('Adicione dois pontos no mapa para ver o perfil de elevação', w / 2, h / 2) }
  const E = P.map(p => p[2]), mn = E.reduce((a, b) => Math.min(a, b)), mx = E.reduce((a, b) => Math.max(a, b)), tot = D.at(-1);
  const es = nice((mx - mn) / 3 || 1, [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]);
  const lo = Math.floor(mn / es) * es, hi = Math.max(lo + es, Math.ceil(mx / es) * es);
  const W = w - PAD.l - PAD.r, H = h - PAD.t - PAD.b, base = PAD.t + H;
  const sx = d => PAD.l + d / tot * W, sy = e => PAD.t + (1 - (e - lo) / (hi - lo)) * H;

  x.font = MONO; x.lineWidth = 1; x.strokeStyle = 'rgba(237,237,237,.08)'; x.textAlign = 'right';
  for (let e = lo; e <= hi; e += es) {
    const y = Math.round(sy(e)) + .5;
    x.beginPath(); x.moveTo(PAD.l, y); x.lineTo(w - PAD.r, y); x.stroke();
    x.fillText(e + ' m', PAD.l - 8, y);
  }
  const ks = kmStep(tot); x.textAlign = 'center'; x.textBaseline = 'top';
  for (let k = 0; k * 1000 <= tot; k += ks) {
    const X = Math.round(sx(k * 1000)) + .5;
    x.beginPath(); x.moveTo(X, base); x.lineTo(X, base + 4); x.stroke();
    x.fillText(`${km(k * 1000, ks < 1 ? 1 : 0)} km`, Math.min(X, w - PAD.r - 16), base + 8);
  }

  const line = new Path2D(); line.moveTo(sx(0), sy(E[0]));
  P.forEach((p, i) => line.lineTo(sx(D[i]), sy(E[i])));
  const area = new Path2D(line); area.lineTo(sx(tot), base); area.lineTo(sx(0), base); area.closePath();
  const g = x.createLinearGradient(0, PAD.t, 0, base);
  g.addColorStop(0, 'rgba(30,167,103,.45)'); g.addColorStop(1, 'rgba(30,167,103,.04)');
  x.fillStyle = g; x.fill(area);
  x.strokeStyle = '#1EA767'; x.lineWidth = 1.5; x.lineJoin = 'round'; x.stroke(line);

  // ponto mais alto
  const im = E.indexOf(mx), PX = sx(D[im]), PY = sy(mx);
  x.fillStyle = '#ededed'; x.beginPath(); x.arc(PX, PY, 3, 0, 7); x.fill();
  x.font = '500 ' + MONO; x.textBaseline = 'bottom'; x.textAlign = PX > w - 80 ? 'right' : PX < PAD.l + 40 ? 'left' : 'center';
  x.fillText(`${Math.round(mx)} m`, PX, PY - 6);

  if (idx == null) return;
  const X = sx(D[idx]), Y = sy(E[idx]), right = X > w / 2, t = `${km(D[idx], 2)} km · ${Math.round(E[idx])} m`;
  x.strokeStyle = '#CE5BA4'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(X, PAD.t); x.lineTo(X, base); x.stroke();
  x.fillStyle = '#CE5BA4'; x.strokeStyle = '#0f0f10'; x.lineWidth = 2; x.beginPath(); x.arc(X, Y, 4, 0, 7); x.fill(); x.stroke();
  x.font = MONO; const tw = x.measureText(t).width + 16, tx = right ? X - 8 - tw : X + 8;
  x.fillStyle = '#232325'; x.beginPath(); x.roundRect(tx, PAD.t, tw, 24, 6); x.fill();
  x.fillStyle = '#ededed'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(t, tx + 8, PAD.t + 12);
}

// Perfil: ponteiro (mouse/toque) e teclado (role=slider).
const prof = $('#prof');
let cur = null;
function showAt(i) {
  cur = i; draw(i); dot.setLatLng(P[i]).addTo(map);
  prof.setAttribute('aria-valuenow', Math.round(D[i]));
  prof.setAttribute('aria-valuetext', `${km(D[i], 2)} km, altitude ${Math.round(P[i][2])} m`);
}
const hideCur = () => { cur = null; draw(); dot.remove() };
prof.onpointermove = prof.onpointerdown = e => {
  if (P.length < 2) return;
  const d = (e.offsetX - PAD.l) / (prof.clientWidth - PAD.l - PAD.r) * D.at(-1);
  const i = D.findIndex(v => v >= d);
  showAt(i < 0 ? P.length - 1 : i);
};
prof.onpointerleave = prof.onblur = hideCur;
prof.onkeydown = e => {
  if (P.length < 2) return;
  const n = P.length, s = Math.max(1, Math.round(n / 100)), big = Math.max(1, Math.round(n / 10));
  const step = { ArrowRight: s, ArrowUp: s, ArrowLeft: -s, ArrowDown: -s, PageUp: big, PageDown: -big }[e.key];
  const i = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : step != null ? Math.min(n - 1, Math.max(0, (cur ?? 0) + step)) : null;
  if (i != null) { e.preventDefault(); showAt(i) }
};
window.onresize = () => draw(cur ?? undefined);

map.on('click', e => ghost || add([e.latlng.lat, e.latlng.lng]));
$('#add-center').onclick = () => { const c = map.getCenter(); add([c.lat, c.lng]) };
$('#modes').onclick = e => { const m = e.target.closest('button')?.dataset.m; if (m) { mode = m; render() } };
$('#name').value = name;
$('#name').oninput = save;

$('#undo').onclick = () => run(() => { if (hist.length) ({ wps, segs } = JSON.parse(hist.pop())) });
$('#clear').onclick = () => run(() => { snap(); wps = []; segs = [] });
$('#reverse').onclick = () => run(() => { snap(); wps.reverse(); segs.reverse().forEach(s => s.pts.reverse()) });
$('#outback').onclick = () => run(() => {
  if (wps.length < 2) return;
  snap();
  wps = [...wps, ...wps.slice(0, -1).reverse()];
  segs = [...segs, ...[...segs].reverse().map(s => ({ m: s.m, pts: [...s.pts].reverse() }))];
});
document.onkeydown = e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.target.tagName !== 'INPUT') { e.preventDefault(); $('#undo').click() }
};

$('#search').onsubmit = async e => {
  e.preventDefault();
  const q = $('#q').value.trim(); if (!q) return;
  say('Buscando', true);
  try {
    const [r] = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q)).then(r => r.json());
    if (r) { map.setView([r.lat, r.lon], 14); say('') } else say(`Local não encontrado: ${q}`);
  } catch { say('Sem conexão com a busca, tente de novo') }
};

$('#export').onclick = () => {
  if (P.length < 2) return;
  const n = $('#name').value || 'rota', esc = s => s.replace(/[<>&"]/g, c => `&#${c.charCodeAt(0)};`);
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Ride Planner" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>${esc(n)}</name><trkseg>
${P.map(p => `<trkpt lat="${p[0]}" lon="${p[1]}"><ele>${p[2]}</ele></trkpt>`).join('\n')}
</trkseg></trk></gpx>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([gpx], { type: 'application/gpx+xml' }));
  a.download = n + '.gpx';
  a.click();
  say(`Arquivo ${n}.gpx exportado`);
};

$('#import-btn').onclick = () => $('#import').click();
$('#import').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  const doc = new DOMParser().parseFromString(await f.text(), 'application/xml');
  const pts = [...doc.querySelectorAll('trkpt,rtept')].map(n => [+n.getAttribute('lat'), +n.getAttribute('lon'), +n.querySelector('ele')?.textContent || 0]);
  e.target.value = '';
  if (pts.length < 2) return say('Esse GPX não tem pontos de trilha');
  // ponytail: trilha importada vira um único segmento "reto"; arrastar as pontas refaz em linha reta.
  run(() => {
    snap();
    wps = [pts[0].slice(0, 2), pts.at(-1).slice(0, 2)];
    segs = [{ m: 'straight', pts }];
    $('#name').value = doc.querySelector('name')?.textContent || f.name.replace(/\.gpx$/i, '');
    map.fitBounds(pts);
  });
};

lucide.createIcons();
render();
if (P.length) map.fitBounds(P);
