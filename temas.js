// Plantillas de diseño de Silla (las usan la app y la página de reservas)
window.SILLA_TEMAS = {
  clasico: { nombre: 'Negro y oro',      bg: '#0c0b0a', card: '#171513', card2: '#211e1a', line: '#332d25', txt: '#f5efe6', mut: '#a59a8a', acc: '#c99a4b', acc2: '#ecc77e', onacc: '#1a1206', claro: false },
  urbano:  { nombre: 'Barber pole',      bg: '#0b0e16', card: '#141a26', card2: '#1c2333', line: '#2b3448', txt: '#f3f5fa', mut: '#97a1b6', acc: '#c8323f', acc2: '#ff7d86', onacc: '#ffffff', claro: false },
  vintage: { nombre: 'Whisky y cuero',   bg: '#120d09', card: '#1d1510', card2: '#281d15', line: '#3d2c1f', txt: '#f6ebdd', mut: '#b19d87', acc: '#c27a3a', acc2: '#e9a865', onacc: '#1c0f05', claro: false },
  bosque:  { nombre: 'Verde inglés',     bg: '#08120d', card: '#0f1d16', card2: '#16281f', line: '#24402f', txt: '#eef4ee', mut: '#93ab9b', acc: '#c5a35e', acc2: '#e6c98a', onacc: '#13200f', claro: false },
  acero:   { nombre: 'Navaja de acero',  bg: '#0d0f12', card: '#171a1f', card2: '#20242b', line: '#323842', txt: '#f1f3f6', mut: '#9aa2ae', acc: '#b9c2cf', acc2: '#e6ebf2', onacc: '#111418', claro: false },
  claro:   { nombre: 'Marfil y negro',   bg: '#f3eee6', card: '#fffcf7', card2: '#ece4d7', line: '#ddd2c1', txt: '#1b1712', mut: '#6f665a', acc: '#1b1712', acc2: '#9b7537', onacc: '#f5e9d3', claro: true }
};
window.SILLA_ORDEN = ['clasico', 'urbano', 'vintage', 'bosque', 'acero', 'claro'];
window.aplicarTema = function (id) {
  const t = window.SILLA_TEMAS[id] || window.SILLA_TEMAS.clasico;
  const r = document.documentElement.style;
  ['bg', 'card', 'card2', 'line', 'txt', 'mut', 'acc', 'acc2', 'onacc'].forEach(k => r.setProperty('--' + k, t[k]));
  document.documentElement.dataset.claro = t.claro ? '1' : '';
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', t.bg);
  return t;
};
